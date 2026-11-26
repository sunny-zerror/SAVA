"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { BOX, BOX_FRONT, createSavaBox } from "@/lib/sava-box";
import { type SavaStickVariant, STICK_VARIANTS } from "@/lib/sava-stick";
import { createStickStage, type Stick } from "@/lib/stick-stage";
import { lerp, TURN } from "@/lib/turntable";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const isVariant = (value: string | undefined): value is SavaStickVariant => !!value && value in STICK_VARIANTS;
const fitOf = (el: HTMLElement | null) => Number(el?.dataset.modelFit ?? 1);

// How far the carton tips its top towards us (radians), its face always square on to the screen: rising
// in, while packing (enough to see into it), at rest
const TIP = { rise: 0.8, packing: 0.42, rest: 0.14 };
/** The packed stick's height, as a share of the carton's (it narrows to fit inside if need be) */
const PACKED = 0.86;

/**
 * The SAVA sticks on /home1, in 3D on one fixed transparent canvas over the page.
 *   – The hero stick follows the hero section's --stick-move (CabinetScroll): it leaves its shelf
 *     ([data-model-anchor="shelf"], whose photo hides while it's away) for the middle of the last frame
 *     ([data-model-anchor="spot"]), rising in an arc and growing, and turning once about its upright
 *     axis on the way, so it lands facing us. There it breathes, swaying a little side to side.
 *   – As the bestsellers scroll up after it, it comes down into the middle card
 *     ([data-model-anchor="bestseller"]), settling as that card is centred, then rides on over the
 *     packing scene ([data-model-anchor="pack"]), landing as that section pins.
 *   – There the carton (src/lib/sava-box.ts) follows the variables CabinetPackMotion tweens on that
 *     section: it rises into its slot ([data-model-anchor="box"]) and opens, the stick lines up over it
 *     in its frame and drops in — hidden behind the front panel by the depth buffer, like any real box —
 *     and it shuts and comes to rest in its last slot ([data-model-anchor="box-end"]), floating gently;
 *     then, as the photo card opens round it, it settles into its gap on the shelf photo
 *     ([data-model-anchor="box-shelf"]) and hands over to the photo of it there (data-placed).
 *     It faces straight out of the screen throughout, only tipping its top towards us.
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
      const pack = anchor("pack");
      const boxSlot = anchor("box");
      const boxEnd = anchor("box-end");
      const boxShelf = anchor("box-shelf");
      const section = shelf?.closest("section");
      const packSection = pack?.closest("section");
      if (!stage) return; // No WebGL — the photos stay
      if (disposed || !shelf || !spot || !section) {
        stage.dispose();
        return;
      }
      const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-model-static]")).filter((el) =>
        isVariant(el.dataset.modelVariant),
      );

      // The carton only where there's a packing scene; a missing print leaves its face plain
      const packing =
        pack && boxSlot && boxEnd && packSection
          ? stage
              .loadTexture(BOX_FRONT.src)
              .catch(() => undefined)
              .then((print) => createSavaBox(stage.THREE, print))
          : null;
      const [stick, ...others] = await Promise.all([
        stage.build("balanced"),
        ...slots.map((el) => stage.build(el.dataset.modelVariant as SavaStickVariant)),
      ]);
      const box = await packing;
      if (disposed) {
        stage.dispose();
        return;
      }
      if (box) stage.add(box.group);
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
      // middle card (from the bestsellers' first peek until it's centred), then over the packing scene
      // (arriving as it pins)
      const legs: { el: HTMLElement; trigger: ScrollTrigger; progress: number }[] = [];
      for (const el of [card, pack]) {
        if (!el) continue;
        const previous = legs.at(-1)?.trigger;
        const trigger = ScrollTrigger.create({
          trigger: el.closest("section") ?? el,
          start: previous ? () => previous.end : "top bottom",
          ...(el === pack ? { end: "top top" } : { endTrigger: el, end: "center center" }),
        });
        legs.push({ el, trigger, progress: 0 });
      }

      // The packed stick's scale (px per model unit) for a carton `h` px tall
      const packedScale = (h: number) =>
        h *
        Math.min(
          PACKED / stick.size.y,
          (BOX.width - 4 * BOX.board) / stick.size.x,
          (BOX.depth - 4 * BOX.board) / stick.size.z,
        );
      const point = new stage.THREE.Vector3();
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

        // Middle → the card, as the bestsellers come up, then on over the packing scene
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

        // The carton: up from below the screen into its slot, then on to rest, at the packing scene's pace
        const vars = packSection?.style;
        const value = (name: string) => Number(vars?.getPropertyValue(name)) || 0;
        const rise = value("--box-in");
        const open = value("--box-open");
        const hover = value("--stick-hover");
        const into = value("--stick-pack");
        const pose = value("--box-pose");
        const settle = value("--box-fit");
        let boxHeight = 0;
        if (box && boxSlot && boxEnd) {
          const a = boxSlot.getBoundingClientRect();
          const b = boxEnd.getBoundingClientRect();
          boxHeight = lerp(a.height, b.height, pose);
          let x = lerp(a.left + a.width / 2, b.left + b.width / 2, pose);
          let y = lerp(window.innerHeight + boxHeight, lerp(a.top + a.height / 2, b.top + b.height / 2, pose), rise);
          // Into its gap on the shelf photo as the card opens round it, standing square to the photo
          if (boxShelf && settle > 0) {
            const r = boxShelf.getBoundingClientRect();
            x = lerp(x, r.left + r.width / 2, settle);
            y = lerp(y, r.top + r.height / 2, settle);
            boxHeight = lerp(boxHeight, r.height, settle);
          }
          // Settled, the photo of it there takes over, to ride out clipped with the shelf photo
          const placed = !!boxShelf && settle >= 0.999;
          if (boxShelf && placed !== boxShelf.hasAttribute("data-placed"))
            boxShelf.toggleAttribute("data-placed", placed);
          // At rest it floats a touch, up and down
          const float = Math.sin(time * 1.1) * 0.01 * boxHeight * pose * (1 - settle);
          box.group.visible = rise > 0.001 && !placed && onScreen(y - boxHeight / 2, boxHeight);
          box.group.position.set(x, -(y + float), 0);
          box.group.scale.setScalar(boxHeight);
          box.group.rotation.set(lerp(lerp(lerp(TIP.rise, TIP.packing, rise), TIP.rest, pose), 0, settle), 0, 0);
          box.open(open);
          box.group.updateMatrixWorld();
          if (box.group.visible) visible++;
        }

        // The stick: upright in its slot so far; then lined up over the carton's opening in its frame, and down in
        let x = left + width / 2;
        let y = -(top + height / 2);
        let z = 0;
        let scale = stage.fitScale(stick, width, height, fit);
        let spin = TURN * ease(clamp01((e - 0.1) / 0.75)) + Math.sin(time * 0.7) * 0.18 * landed;
        stick.tilt.rotation.set(0, 0, 0);
        if (box && hover > 0) {
          const packed = packedScale(boxHeight);
          const length = (packed * stick.size.y) / boxHeight; // In carton heights
          const over = BOX.height / 2 + 0.05 + length / 2;
          const inside = -BOX.height / 2 + BOX.board + length / 2;
          box.group.localToWorld(point.set(0, lerp(over, inside, into), 0));
          x = lerp(x, point.x, hover);
          y = lerp(y, point.y, hover);
          z = lerp(z, point.z, hover);
          scale = lerp(scale, packed, hover);
          stick.tilt.rotation.set(box.group.rotation.x * hover, 0, 0);
          // One more turn as it lines up, so it goes in facing front
          spin += TURN * hover;
        }

        // Hidden once it's in and the lid's shut on it
        const packedAway = into >= 1 && open <= 0.001;
        stick.tilt.visible = away && !packedAway && (hover > 0 ? !!box?.group.visible : onScreen(top, height));
        if (stick.tilt.visible) {
          visible++;
          stick.tilt.position.set(x, y, z);
          stick.tilt.scale.setScalar(scale);
          stick.spin.rotation.y = spin + (hoverTurn.get(stick)?.y ?? 0);
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
        boxShelf?.removeAttribute("data-placed");
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
