"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { type SavaStickVariant, STICK_VARIANTS } from "@/lib/sava-stick";
import { createStickStage, type Stick } from "@/lib/stick-stage";
import { lerp, TURN } from "@/lib/turntable";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const isVariant = (value: string | undefined): value is SavaStickVariant => !!value && value in STICK_VARIANTS;
const fitOf = (el: HTMLElement | null) => Number(el?.dataset.modelFit ?? 1);

/**
 * The SAVA sticks on /home1, in 3D on one fixed transparent canvas over the page.
 *   – The hero stick follows the hero section's --stick-move (CabinetScroll): it leaves its shelf
 *     ([data-model-anchor="shelf"], whose photo hides while it's away) for the middle of the last frame
 *     ([data-model-anchor="spot"]), rising in an arc and growing, and turning once about its upright
 *     axis on the way, so it lands facing us. There it breathes, swaying a little side to side.
 *   – As the bestsellers scroll up after it, it comes down into the middle card
 *     ([data-model-anchor="bestseller"]), settling as that card is centred, then rides on into the care
 *     showcase's viewfinder ([data-model-anchor="care"]), as on /home: landing in the middle as that
 *     section pins, it stands there while the heading sweeps past behind it. As the photo card opens it
 *     settles into its gap on the shelf in the first photo ([data-model-anchor="photo"], CabinetCare) by
 *     `--stick-fit` on that section (CareShowcaseMotion), and there hands over to the photo of it standing
 *     in the gap (data-placed), which rides out with the shelf photo: in the photo for good.
 *   – The other bestseller cards ([data-model-static]) hold sticks of their own, and hovering a card
 *     ([data-model-hover]) turns its stick one smooth full turn.
 * Without WebGL, or with reduced motion, nothing is drawn: the photos stay.
 */
export default function CabinetTraveller() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    // Loaded on demand so three.js stays out of the page's first bundle
    createStickStage(canvas).then(async (stage) => {
      const anchor = (name: string) => document.querySelector<HTMLElement>(`[data-model-anchor="${name}"]`);
      const shelf = anchor("shelf");
      const spot = anchor("spot");
      const card = anchor("bestseller");
      const care = anchor("care");
      const photo = anchor("photo");
      const section = shelf?.closest("section");
      const careSection = care?.closest("section") ?? null;
      if (!stage) return; // No WebGL — the photos stay
      if (disposed || !shelf || !spot || !section) {
        stage.dispose();
        return;
      }
      const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-model-static]")).filter((el) =>
        isVariant(el.dataset.modelVariant),
      );

      const [stick, ...others] = await Promise.all([
        stage.build("balanced"),
        ...slots.map((el) => stage.build(el.dataset.modelVariant as SavaStickVariant)),
      ]);
      if (disposed) {
        stage.dispose();
        return;
      }
      await stage.warm();
      const fixed = slots.map((el, i) => ({ el, stick: others[i] as Stick }));
      // Hides the photos the 3D sticks stand in for (model-ready: in globals.css)
      document.documentElement.dataset.model = "ready";

      // One full turn when a card is hovered, on top of whatever the stick is doing; a turn already
      // under way finishes before another starts
      const hoverTurn = new Map<Stick, { y: number }>([stick, ...others].map((s) => [s as Stick, { y: 0 }]));
      const hoverSticks = new Map<Element, Stick[]>();
      const own = (el: Element | null, s: Stick) => {
        const area = el?.closest("[data-model-hover]");
        if (area) hoverSticks.set(area, [...(hoverSticks.get(area) ?? []), s]);
      };
      fixed.forEach(({ el, stick: s }) => own(el, s));
      own(card, stick);
      const hoverOff = [...hoverSticks].map(([area, sticks]) => {
        const turn = () => {
          for (const s of sticks) {
            const extra = hoverTurn.get(s);
            if (extra && !gsap.isTweening(extra)) {
              gsap.to(extra, { y: extra.y + TURN, duration: 1.4, ease: "power2.inOut" });
            }
          }
        };
        area.addEventListener("pointerenter", turn);
        return () => {
          area.removeEventListener("pointerenter", turn);
          hoverTurn.forEach((extra) => gsap.killTweensOf(extra));
        };
      });

      // The page-scrolled legs after the hero's pin, each starting where the last one ends: into the
      // middle card (from the bestsellers' first peek until it's centred), then on to the viewfinder
      // (arriving as the care showcase pins)
      const legs: { el: HTMLElement; trigger: ScrollTrigger; progress: number }[] = [];
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

      const onScreen = (top: number, height: number) => top + height > -200 && top < window.innerHeight + 200;

      let away = false;
      const render = (time: number, deltaMs: number) => {
        let visible = 0;
        const move = Number(section.style.getPropertyValue("--stick-move")) || 0;

        // The shelf's photo stands in until the stick leaves it
        const leaving = move > 0.001;
        if (leaving !== away) {
          away = leaving;
          shelf.toggleAttribute("data-flown", away);
        }

        // Shelf → middle, up in an arc, one turn about its upright axis through the flight
        const e = ease(move);
        const from = shelf.getBoundingClientRect();
        const to = spot.getBoundingClientRect();
        let left = lerp(from.left, to.left, e);
        let top = lerp(from.top, to.top, e);
        let width = lerp(from.width, to.width, e);
        let height = lerp(from.height, to.height, e);
        let fit = 1;
        const arc = Math.sin(Math.PI * e) * window.innerHeight * 0.14;
        // Each leg trails the scroll a little, by time rather than frames (the same feel at any frame rate)
        const follow = 1 - 0.86 ** (deltaMs / (1000 / 60));
        legs.forEach((leg) => (leg.progress = lerp(leg.progress, leg.trigger.progress, follow)));
        // Landed: a slow breath and a little sway, which settle as it heads for the card
        const landed = clamp01((move - 0.9) / 0.1) * (1 - ease(legs[0]?.progress ?? 0));
        const breath = Math.sin(time * 1.3) * 0.01 * to.height * landed;
        top += breath - arc;

        // Middle → the card, as the bestsellers come up, then on into the viewfinder
        for (const leg of legs) {
          if (leg.progress < 0.0005) break; // Later legs can't have started either
          const k = ease(leg.progress);
          const r = leg.el.getBoundingClientRect();
          left = lerp(left, r.left, k);
          top = lerp(top, r.top, k);
          width = lerp(width, r.width, k);
          height = lerp(height, r.height, k);
          fit = lerp(fit, fitOf(leg.el), k);
        }

        // Viewfinder → its gap on the shelf photo as the card opens (eased by the scroll scene itself)
        const settle = Number(careSection?.style.getPropertyValue("--stick-fit")) || 0;
        if (photo && settle > 0) {
          const r = photo.getBoundingClientRect();
          left = lerp(left, r.left, settle);
          top = lerp(top, r.top, settle);
          width = lerp(width, r.width, settle);
          height = lerp(height, r.height, settle);
          fit = lerp(fit, fitOf(photo), settle);
        }
        // Settled, the photo of it there takes over, to ride out with the shelf photo
        const placed = !!photo && settle >= 0.999;
        if (photo && placed !== photo.hasAttribute("data-placed")) photo.toggleAttribute("data-placed", placed);

        // Upright and facing front, after its one turn in flight
        stick.tilt.visible = away && !placed && onScreen(top, height);
        if (stick.tilt.visible) {
          visible++;
          stick.tilt.position.set(left + width / 2, -(top + height / 2), 0);
          stick.tilt.scale.setScalar(stage.fitScale(stick, width, height, fit));
          stick.spin.rotation.y =
            TURN * ease(clamp01((e - 0.1) / 0.75)) +
            Math.sin(time * 0.7) * 0.18 * landed +
            (hoverTurn.get(stick)?.y ?? 0);
        }

        for (const { el, stick: s } of fixed) {
          const r = el.getBoundingClientRect();
          s.tilt.visible = onScreen(r.top, r.height);
          if (!s.tilt.visible) continue;
          visible++;
          s.tilt.position.set(r.left + r.width / 2, -(r.top + r.height / 2), 0);
          s.tilt.scale.setScalar(stage.fitScale(s, r.width, r.height, fitOf(el)));
          s.spin.rotation.y = hoverTurn.get(s)?.y ?? 0;
        }

        if (!visible) {
          stage.clear();
          return; // Nothing on screen — skip the draw
        }
        stage.render();
      };
      gsap.ticker.add(render);
      ScrollTrigger.refresh();

      cleanup = () => {
        gsap.ticker.remove(render);
        legs.forEach((leg) => leg.trigger.kill());
        hoverOff.forEach((off) => off());
        shelf.removeAttribute("data-flown");
        photo?.removeAttribute("data-placed");
        delete document.documentElement.dataset.model;
        stage.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 size-full" />;
}
