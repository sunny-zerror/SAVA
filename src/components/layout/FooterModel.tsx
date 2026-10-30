"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { createStickStage } from "@/lib/stick-stage";
import { drag as dragTurntable, lerp, turn, TURN } from "@/lib/turntable";

/** The footer's slot on the rock ledge (Footer) */
const ANCHOR = "[data-footer-model-anchor]";
/** Turns the stick makes on the way down, settling front-facing as it lands */
const DROP_TURNS = 2;

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The footer's own SAVA stick, on every page. It's drawn by a fixed canvas over the page (outside
 * the footer), so it can come from above it: as the footer scrolls in, the stick drops from above
 * the viewport, arcing in from the right, spinning and tilted, and lands upright on the rock ledge
 * exactly when the footer's bottom meets the viewport's bottom. Scrolling back up lifts it away.
 * Once landed it can be dragged to spin. The static stick in the slot shows until the model is
 * live (html[data-footer-model="ready"]), and for reduced motion / no WebGL. It lives in the layout
 * with the footer, so it stays across navigation; SmoothScroll re-measures the scroll per route.
 */
export default function FooterModel() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    createStickStage(canvas).then(async (stage) => {
      const anchor = document.querySelector<HTMLElement>(ANCHOR);
      const footer = anchor?.closest("footer");
      if (!stage) return; // No WebGL — the static stick stays
      if (disposed || !anchor || !footer) {
        stage.dispose();
        return;
      }

      const stick = await stage.build("balanced");
      const { state, tilt, spin } = stick;

      // Scrubbed by the footer's own scroll: from its top entering to its bottom meeting the viewport's
      const trigger = ScrollTrigger.create({ trigger: footer, start: "top bottom", end: "bottom bottom" });
      let progress = 0;

      // Drag to spin once it has landed (springs back to front on release)
      let dragging: { x: number; y: number; t: number } | null = null;
      const onDown = (e: PointerEvent) => {
        if (progress > 0.98 && (e.target as Element).closest?.(ANCHOR)) {
          dragging = { x: e.clientX, y: e.clientY, t: performance.now() };
        }
      };
      const onMove = (e: PointerEvent) => {
        if (!dragging) return;
        const now = performance.now();
        dragTurntable(state, e.clientX - dragging.x, e.clientY - dragging.y, now - dragging.t);
        dragging = { x: e.clientX, y: e.clientY, t: now };
      };
      const onUp = () => {
        dragging = null;
        state.tipTarget = 0;
      };
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      let ready = false;
      let cleared = false;
      const render = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs / 1000, 0.05);
        // Smooth the scrubbed progress so the drop glides rather than tracking every wheel tick
        progress = lerp(progress, trigger.progress, 1 - Math.exp(-dt * 9));
        turn(state, dt, 0, dragging !== null);

        if (progress < 0.001) {
          if (!cleared) {
            stage.clear();
            cleared = true;
          }
          return; // Still above the fold — nothing to draw
        }
        cleared = false;

        const slot = anchor.getBoundingClientRect();
        const vw = window.innerWidth;
        // Most of the drop in the second half, touching down softly as the footer bottoms out
        const fall = easeInOutCubic(progress);
        const drift = easeInOut(progress); // sideways arc

        // From above the top of the viewport, off to the right, down into the slot
        const endX = slot.left + slot.width / 2;
        const endY = slot.top + slot.height / 2;
        const startX = Math.min(vw * 0.6, endX + vw * 0.35);
        const startY = -slot.height * 0.9;
        const x = lerp(startX, endX, drift);
        const y = lerp(startY, endY, fall);

        tilt.position.set(x, -y, 0);
        tilt.scale.setScalar(stage.fitScale(stick, slot.width, slot.height) * lerp(0.8, 1, fall));
        // Leans into the fall, straightening up as it lands
        tilt.rotation.set(state.tip + (1 - fall) * 0.35, 0, (1 - fall) * -0.45);
        spin.rotation.y = state.angle + (1 - fall) * DROP_TURNS * TURN;

        stage.render();
        if (!ready) {
          ready = true;
          document.documentElement.dataset.footerModel = "ready";
        }
      };
      gsap.ticker.add(render);

      cleanup = () => {
        gsap.ticker.remove(render);
        trigger.kill();
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        delete document.documentElement.dataset.footerModel;
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
