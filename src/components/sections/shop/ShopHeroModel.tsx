"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { type SavaStickVariant, STICK_VARIANTS } from "@/lib/sava-stick";
import { createStickStage, type Stick } from "@/lib/stick-stage";
import { drag as dragTurntable, lerp, turn, TURN, type Turntable } from "@/lib/turntable";

/*
 * Slots in the shop hero's stage, each marked data-shop-slot with data-variant (balanced / kinetic /
 * renewed) and an optional data-tilt (deg, like CSS rotate) for a stick that leans.
 */
const SLOT = "[data-shop-slot]";
const isVariant = (value: string | undefined): value is SavaStickVariant => !!value && value in STICK_VARIANTS;

/**
 * The shop hero's three SAVA sticks. On arrival each drops in from above the viewport — one after
 * another, spinning, leaning into the fall — and settles softly into its place: the balanced stick
 * leaning, the other two upright on their wood blocks. Then each can be dragged to spin, easing
 * back to face front. A fixed canvas over the page draws them at their slots' rects, so they stay
 * put as the page scrolls. The photo's own sticks show until the models are live
 * (html[data-shop-model="ready"]), and for reduced motion / no WebGL.
 */
export default function ShopHeroModel() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    createStickStage(canvas).then(async (stage) => {
      const slots = Array.from(document.querySelectorAll<HTMLElement>(SLOT)).filter((el) =>
        isVariant(el.dataset.variant),
      );
      if (!stage) return; // No WebGL — the photo's sticks stay
      if (disposed || slots.length === 0) {
        stage.dispose();
        return;
      }

      const placed = await Promise.all(
        slots.map(async (slot) => ({
          slot,
          stick: (await stage.build(slot.dataset.variant as SavaStickVariant)) as Stick,
          tilt: Number(slot.dataset.tilt ?? 0),
          drop: { value: 0 }, // 0 above the viewport → 1 landed
        })),
      );

      // The drops, one after another
      const drops = gsap.timeline({ delay: 0.35 });
      placed.forEach(({ drop }, i) => {
        drops.to(drop, { value: 1, duration: 1.7, ease: "expo.out" }, i * 0.2);
      });

      // Drag a stick to spin it (springs back to front on release)
      let dragging: { state: Turntable; x: number; y: number; t: number } | null = null;
      const onDown = (e: PointerEvent) => {
        const slot = (e.target as Element).closest?.(SLOT);
        const hit = placed.find((p) => p.slot === slot);
        if (hit && hit.drop.value > 0.98)
          dragging = { state: hit.stick.state, x: e.clientX, y: e.clientY, t: performance.now() };
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const now = performance.now();
        dragTurntable(dragging.state, e.clientX - dragging.x, e.clientY - dragging.y, now - dragging.t);
        dragging = { ...dragging, x: e.clientX, y: e.clientY, t: now };
      };
      const onUp = () => {
        if (dragging) dragging.state.tipTarget = 0;
        dragging = null;
      };
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      let ready = false;
      let cleared = false;
      const render = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs / 1000, 0.05);
        let visible = 0;

        for (const { slot, stick, tilt, drop } of placed) {
          const { state, tilt: tiltGroup, spin } = stick;
          turn(state, dt, 0, dragging?.state === state);
          const r = slot.getBoundingClientRect();
          const landed = drop.value;
          // From just above the viewport straight down into the slot
          const endY = r.top + r.height / 2;
          const y = lerp(-r.height * 0.75, endY, landed);
          const x = r.left + r.width / 2;
          tiltGroup.visible = landed > 0.001 && y + r.height > -100 && y - r.height < window.innerHeight + 100;
          if (!tiltGroup.visible) continue;
          visible++;

          tiltGroup.position.set(x, -y, 0);
          tiltGroup.scale.setScalar(stage.fitScale(stick, r.width, r.height) * lerp(0.85, 1, landed));
          // Leans into the fall (a little past its resting lean), straightening as it lands
          const lean = tilt + (1 - landed) * 18;
          tiltGroup.rotation.set(state.tip + (1 - landed) * 0.3, 0, (-lean * Math.PI) / 180);
          spin.rotation.y = state.angle + (1 - landed) * 1.5 * TURN;
        }

        if (!visible) {
          if (!cleared) stage.clear();
          cleared = true;
          return;
        }
        cleared = false;
        stage.render();
        if (!ready) {
          ready = true;
          document.documentElement.dataset.shopModel = "ready";
        }
      };
      gsap.ticker.add(render);

      cleanup = () => {
        gsap.ticker.remove(render);
        drops.kill();
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        delete document.documentElement.dataset.shopModel;
        stage.dispose();
      };
      if (disposed) cleanup();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 size-full" />;
}
