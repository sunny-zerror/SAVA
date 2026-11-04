"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { createStickStage } from "@/lib/stick-stage";
import { drag as dragTurntable, lerp, turn, TURN } from "@/lib/turntable";

/** The footer's slot on the rock ledge (Footer) */
const ANCHOR = "[data-footer-model-anchor]";
/** Turns the stick makes on the way down, settling front-facing as it lands */
const DROP_TURNS = 2;
/** Seconds from leaving the top of the viewport to touching down; lifting away is quicker */
const LAND = 1.6;
const LIFT = 0.7;

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * The footer's own SAVA stick, on every page — its own canvas, renderer and stick, separate from the
 * home page's travelling one (HomeModel). It's drawn by a fixed canvas over the page, clipped to the
 * footer as if the footer hid its overflow: once the footer's top reaches the middle of the viewport,
 * the stick drops in through the footer's top edge, arcing in from the right, spinning and tilted,
 * and lands upright on the rock ledge — a timed drop, not tied to the scroll. Scrolling back above that point lifts it
 * away. Once landed it can be dragged to spin. The slot's static stick shows until the model is
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
      await stage.warm();
      if (disposed) {
        stage.dispose();
        return;
      }
      const { state, tilt, spin } = stick;
      const shadow = anchor.querySelector<HTMLElement>("[data-footer-model-shadow]");
      // Live: the static stick leaves the slot empty for the drop
      document.documentElement.dataset.footerModel = "ready";

      // 0 = above the viewport, 1 = landed; tweened in time once the footer's top passes the middle
      const drop = { progress: 0 };
      let tween: gsap.core.Tween | undefined;
      const to = (progress: number, duration: number, ease: string) => {
        tween?.kill();
        tween = gsap.to(drop, { progress, duration, ease });
      };
      const trigger = ScrollTrigger.create({
        trigger: footer,
        // The footer's top at the viewport's middle — or the page's bottom, on a page too short to get there
        start: () =>
          Math.min(
            footer.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2,
            ScrollTrigger.maxScroll(window) - 1,
          ),
        end: "max",
        onEnter: () => to(1, LAND * (1 - drop.progress), "none"),
        onLeaveBack: () => to(0, LIFT * drop.progress, "power1.in"),
      });
      // Already past it (a reload low on the page, or a short page): land straight away
      if (trigger.isActive) to(1, LAND, "none");

      // Drag to spin once it has landed (springs back to front on release)
      let dragging: { x: number; y: number; t: number } | null = null;
      const onDown = (e: PointerEvent) => {
        if (drop.progress > 0.98 && (e.target as Element).closest?.(ANCHOR)) {
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

      let cleared = false;
      const render = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs / 1000, 0.05);
        const { progress } = drop;
        turn(state, dt, 0, dragging !== null);

        if (progress < 0.001) {
          if (!cleared) {
            stage.clear();
            if (shadow) shadow.style.opacity = "0";
            cleared = true;
          }
          return; // Not dropped yet — nothing to draw
        }
        cleared = false;

        // Measured every frame, so it lands in the slot even while the page is still scrolling
        const slot = anchor.getBoundingClientRect();
        const top = footer.getBoundingClientRect().top;
        // Nothing shows above the footer (it's last on the page, so only its top edge needs clipping)
        canvas.style.clipPath = `inset(${Math.max(0, top)}px 0 0 0)`;
        const vw = window.innerWidth;
        // Speeds up through the fall and touches down softly
        const fall = easeInOutCubic(progress);
        const drift = easeInOut(progress); // sideways arc

        // From just above the footer's top edge (clipped away), off to the right, down into the slot
        const endX = slot.left + slot.width / 2;
        const endY = slot.top + slot.height / 2;
        const startX = Math.min(vw * 0.6, endX + vw * 0.35);
        const startY = top - slot.height * 0.6;
        const x = lerp(startX, endX, drift);
        const y = lerp(startY, endY, fall);

        tilt.position.set(x, -y, 0);
        tilt.scale.setScalar(stage.fitScale(stick, slot.width, slot.height) * lerp(0.8, 1, fall));
        // Leans into the fall, straightening up as it lands
        tilt.rotation.set(state.tip + (1 - fall) * 0.35, 0, (1 - fall) * -0.45);
        spin.rotation.y = state.angle + (1 - fall) * DROP_TURNS * TURN;
        // The contact shadow darkens over the last stretch of the fall
        if (shadow) shadow.style.opacity = String(gsap.utils.clamp(0, 1, (fall - 0.75) / 0.25));

        stage.render();
      };
      gsap.ticker.add(render);

      cleanup = () => {
        gsap.ticker.remove(render);
        tween?.kill();
        trigger.kill();
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        delete document.documentElement.dataset.footerModel;
        canvas.style.removeProperty("clip-path");
        shadow?.style.removeProperty("opacity");
        stage.dispose();
      };
      if (disposed) cleanup();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      // Anchored above the page during route fades (globals.css, "Page transitions")
      className="pointer-events-none fixed inset-0 z-30 size-full [view-transition-class:site-chrome] [view-transition-name:footer-model]"
    />
  );
}
