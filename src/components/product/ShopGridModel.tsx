"use client";

import { useEffect, useRef } from "react";
import { afterHeadingReveal } from "@/lib/global";
import { gsap } from "@/lib/gsap";
import { type SavaStickVariant, STICK_VARIANTS } from "@/lib/sava-stick";
import { createStickStage } from "@/lib/stick-stage";
import { turn } from "@/lib/turntable";

/*
 * Slots in the shop grid's cards: data-grid-slot with data-variant (balanced / kinetic / renewed)
 * and an optional data-fit (× slot height). The card around a slot is marked data-grid-hover.
 */
const SLOT = "[data-grid-slot]";
const isVariant = (value: string | undefined): value is SavaStickVariant => !!value && value in STICK_VARIANTS;
/** About how long the shop hero's sticks take to load and drop after its headline is in */
const HERO_DROP_MS = 2500;

/**
 * The shop grid's 3D sticks: one per card, facing front, spinning round while its card is hovered
 * and easing back to the front after (as in the home page's bestsellers). A fixed canvas over the
 * page draws them at their slots' rects. The product photos show until the models are live
 * (html[data-grid-model="ready"]), and for reduced motion / no WebGL.
 */
export default function ShopGridModel() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    const start = () =>
      void createStickStage(canvas).then(async (stage) => {
        const slots = Array.from(document.querySelectorAll<HTMLElement>(SLOT)).filter((el) =>
          isVariant(el.dataset.variant),
        );
        if (!stage) return; // No WebGL — the photos stay
        if (disposed || slots.length === 0) {
          stage.dispose();
          return;
        }

        const placed = await Promise.all(
          slots.map(async (slot) => ({ slot, stick: await stage.build(slot.dataset.variant as SavaStickVariant) })),
        );
        await stage.warm();
        if (disposed) {
          stage.dispose();
          return;
        }

        // Hovering a card spins its stick
        const offs = placed.map(({ slot, stick }) => {
          const area = slot.closest("[data-grid-hover]") ?? slot;
          const enter = () => (stick.state.hovered = true);
          const leave = () => (stick.state.hovered = false);
          area.addEventListener("pointerenter", enter);
          area.addEventListener("pointerleave", leave);
          return () => {
            area.removeEventListener("pointerenter", enter);
            area.removeEventListener("pointerleave", leave);
          };
        });

        let ready = false;
        let cleared = false;
        const render = (_time: number, deltaMs: number) => {
          const dt = Math.min(deltaMs / 1000, 0.05);
          let visible = 0;
          for (const { slot, stick } of placed) {
            const { state, tilt, spin } = stick;
            turn(state, dt, 0, false);
            const r = slot.getBoundingClientRect();
            tilt.visible = r.bottom > -100 && r.top < window.innerHeight + 100;
            if (!tilt.visible) continue;
            visible++;
            tilt.position.set(r.left + r.width / 2, -(r.top + r.height / 2), 0);
            tilt.scale.setScalar(stage.fitScale(stick, r.width, r.height, Number(slot.dataset.fit ?? 1)));
            tilt.rotation.set(0, 0, 0);
            spin.rotation.y = state.angle;
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
            document.documentElement.dataset.gridModel = "ready";
          }
        };
        gsap.ticker.add(render);

        cleanup = () => {
          gsap.ticker.remove(render);
          offs.forEach((off) => off());
          delete document.documentElement.dataset.gridModel;
          stage.dispose();
        };
        if (disposed) cleanup();
      });

    // On the first page the shop hero plays first: its headline reveal, then its sticks' drop (both
    // main-thread heavy). Hold this setup until they're done; the photos show meanwhile. Later pages
    // have no hero, so it starts straight away.
    const hero = document.querySelector('[data-heading-effect="intro"]');
    let timer = 0;
    const cancelWait = hero
      ? afterHeadingReveal(hero, () => (timer = window.setTimeout(start, HERO_DROP_MS)))
      : (start(), () => {});

    return () => {
      disposed = true;
      cancelWait();
      window.clearTimeout(timer);
      cleanup();
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 size-full" />;
}
