"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { type SavaStickVariant, STICK_VARIANTS } from "@/lib/sava-stick";
import { createStickStage, type Stick, stickFader } from "@/lib/stick-stage";
import { lerp } from "@/lib/turntable";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const isVariant = (value: string | undefined): value is SavaStickVariant => !!value && value in STICK_VARIANTS;
const fitOf = (el: HTMLElement | null) => Number(el?.dataset.modelFit ?? 1);

/**
 * The 3D SAVA sticks on /home, drawn by one fixed transparent canvas into slots measured every frame
 * (so they track scroll and resize). All stay upright and facing front.
 *   – The travelling stick drops straight down onto the bench ([data-model-anchor="bench"]) as the
 *     heading rises in, its contact shadow ([data-stick-shadow]) gathering as it lands; the pinned
 *     scroll (HeroScroll) carries it to the story's centre slot ([data-model-anchor="story"]) by
 *     `--stick-move` on the section; then, as the page scrolls, it follows it into the middle
 *     bestseller card ([data-model-anchor="bestseller"], whose data-model-variant it wears) and on into
 *     the care showcase's viewfinder ([data-model-anchor="care"]), landing as that section pins. As its
 *     card opens it settles into the first photo's dashed circle ([data-model-anchor="photo"]) by
 *     `--stick-fit` on that section (CareShowcaseMotion), rides out with that photo and fades by
 *     `--stick-out` there.
 *   – The other bestseller cards ([data-model-static]) hold sticks of their own.
 *   – Hovering a bestseller card ([data-model-hover]) turns its stick one smooth full turn.
 * Reduced motion: the traveller stays on the bench and the middle card gets a stick of its own.
 */
export default function HeroStick() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let disposed = false;
    let cleanup = () => {};

    // Loaded on demand so three.js stays out of the page's first bundle
    createStickStage(canvas).then(async (stage) => {
      const slot = document.querySelector<HTMLElement>('[data-model-anchor="bench"]');
      if (!stage) return; // No WebGL — the bestseller photos stay
      if (disposed || !slot) {
        stage.dispose();
        return;
      }
      const story = document.querySelector<HTMLElement>('[data-model-anchor="story"]');
      const card = document.querySelector<HTMLElement>('[data-model-anchor="bestseller"]');
      const care = document.querySelector<HTMLElement>('[data-model-anchor="care"]');
      const circle = document.querySelector<HTMLElement>('[data-model-anchor="photo"]');
      const hero = slot.closest("section");
      const careSection = care?.closest("section") ?? null;
      const shadow = slot.querySelector<HTMLElement>("[data-stick-shadow]");

      const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-model-static]"));
      // Without the journey the middle card holds a stick of its own too
      if (still && card) slots.push(card);
      const statics = slots.filter((el) => isVariant(el.dataset.modelVariant));

      const cardVariant = card?.dataset.modelVariant;
      const [traveller, ...others] = await Promise.all([
        stage.build(isVariant(cardVariant) ? cardVariant : "balanced"),
        ...statics.map((el) => stage.build(el.dataset.modelVariant as SavaStickVariant)),
      ]);
      if (disposed) {
        stage.dispose();
        return;
      }
      const fade = stickFader(traveller);
      await stage.warm();
      const fixed = statics.map((el, i) => ({ el, stick: others[i] as Stick }));

      // One full turn when a card is hovered; a turn already under way finishes before another starts
      const hoverSticks = new Map<Element, Stick[]>();
      const own = (el: Element | null, stick: Stick) => {
        const area = el?.closest("[data-model-hover]");
        if (area) hoverSticks.set(area, [...(hoverSticks.get(area) ?? []), stick]);
      };
      if (!still) {
        fixed.forEach(({ el, stick }) => own(el, stick));
        own(card, traveller);
      }
      const hoverOff = [...hoverSticks].map(([area, sticks]) => {
        const turn = () => {
          for (const { spin } of sticks) {
            if (!gsap.isTweening(spin.rotation)) {
              gsap.to(spin.rotation, { y: spin.rotation.y + Math.PI * 2, duration: 1.4, ease: "power2.inOut" });
            }
          }
        };
        area.addEventListener("pointerenter", turn);
        return () => {
          area.removeEventListener("pointerenter", turn);
          sticks.forEach(({ spin }) => gsap.killTweensOf(spin.rotation));
        };
      });

      // 0 = above the viewport, 1 = standing on the bench
      const landing = { value: still ? 1 : 0 };
      let landingTween: gsap.core.Tween | undefined;
      const offLanding = still
        ? () => {}
        : onIntroDone(() => {
            landingTween = gsap.to(landing, { value: 1, duration: 1.8, ease: "power4.out", delay: 0.5 });
          });

      // The page-scrolled legs after the pinned hero, each starting where the last one ends: into the
      // middle card (from the bestsellers' first peek until it's centred), then on to the viewfinder
      // (arriving as the care showcase pins)
      const legs: { el: HTMLElement; trigger: ScrollTrigger; progress: number }[] = [];
      if (!still) {
        for (const el of [card, care]) {
          if (!el) continue;
          const previous = legs.at(-1)?.trigger;
          const trigger = ScrollTrigger.create({
            trigger: el.closest("section") ?? el,
            start: previous ? () => previous.end : "top bottom",
            ...(el === care ? { end: "top top" } : { endTrigger: el, end: "center center" }),
          });
          legs.push({ el, trigger, progress: 0 });
        }
      }

      const onScreen = (top: number, height: number) => top + height > -100 && top < window.innerHeight + 100;

      let ready = false;
      const render = (_time: number, deltaMs: number) => {
        let visible = 0;
        // Each leg trails the scroll a little, by time rather than frames (the same feel at any frame rate)
        const follow = 1 - 0.86 ** (deltaMs / (1000 / 60));

        // The traveller: bench (dropping in) → story (pinned scroll) → card → viewfinder (page scroll)
        const bench = slot.getBoundingClientRect();
        const lift = (1 - landing.value) * (bench.bottom + 40); // starts just clear of the viewport's top
        const move = Number(hero?.style.getPropertyValue("--stick-move")) || 0;
        const centre = story && move > 0 ? story.getBoundingClientRect() : bench;
        let left = lerp(bench.left, centre.left, move);
        let top = lerp(bench.top - lift, centre.top, move);
        let width = lerp(bench.width, centre.width, move);
        let height = lerp(bench.height, centre.height, move);
        let fit = 1;

        for (const leg of legs) {
          leg.progress = lerp(leg.progress, leg.trigger.progress, follow);
          if (leg.progress < 0.0005) break; // Later legs can't have started either
          const e = ease(leg.progress);
          const r = leg.el.getBoundingClientRect();
          left = lerp(left, r.left, e);
          top = lerp(top, r.top, e);
          width = lerp(width, r.width, e);
          height = lerp(height, r.height, e);
          fit = lerp(fit, fitOf(leg.el), e);
        }

        // Viewfinder → the first photo's circle as the card opens (eased by the scroll scene itself)
        const settle = Number(careSection?.style.getPropertyValue("--stick-fit")) || 0;
        if (circle && settle > 0) {
          const r = circle.getBoundingClientRect();
          left = lerp(left, r.left, settle);
          top = lerp(top, r.top, settle);
          width = lerp(width, r.width, settle);
          height = lerp(height, r.height, settle);
          fit = lerp(fit, fitOf(circle), settle);
        }

        if (shadow) {
          const near = landing.value ** 4 * (1 - move) ** 2;
          shadow.style.opacity = String(near);
          shadow.style.scale = `${0.4 + 0.6 * near} 1`;
        }

        // Fading out as it rides off with the first photo, easing back a touch as it goes
        const opacity = 1 - (Number(careSection?.style.getPropertyValue("--stick-out")) || 0);
        fade(opacity);

        const { tilt } = traveller;
        tilt.visible = landing.value > 0 && opacity > 0.001 && onScreen(top, height);
        if (tilt.visible) {
          visible++;
          tilt.position.set(left + width / 2, -(top + height / 2), 0);
          tilt.scale.setScalar(stage.fitScale(traveller, width, height, fit) * (0.85 + 0.15 * opacity));
        }

        for (const { el, stick } of fixed) {
          const r = el.getBoundingClientRect();
          stick.tilt.visible = onScreen(r.top, r.height);
          if (!stick.tilt.visible) continue;
          visible++;
          stick.tilt.position.set(r.left + r.width / 2, -(r.top + r.height / 2), 0);
          stick.tilt.scale.setScalar(stage.fitScale(stick, r.width, r.height, fitOf(el)));
        }

        if (!visible) {
          stage.clear();
          return; // Nothing on screen (or not dropped yet) — skip the draw
        }
        stage.render();

        if (!ready) {
          ready = true;
          // Hides the bestseller photos the sticks stand in for (model-ready: in globals.css)
          document.documentElement.dataset.model = "ready";
        }
      };
      gsap.ticker.add(render);
      ScrollTrigger.refresh();

      cleanup = () => {
        gsap.ticker.remove(render);
        offLanding();
        landingTween?.kill();
        legs.forEach((leg) => leg.trigger.kill());
        hoverOff.forEach((off) => off());
        delete document.documentElement.dataset.model;
        stage.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 size-full" />;
}
