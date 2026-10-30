"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { type SavaStickVariant, STICK_VARIANTS } from "@/lib/sava-stick";
import { createStickStage, type Stick } from "@/lib/stick-stage";
import { onIntroDone } from "@/lib/intro";
import { drag as dragTurntable, lerp, turn, TURN, type Turntable } from "@/lib/turntable";

/*
 * Stops along the scroll path, in page order. Each is an element marked
 * data-model-anchor="<name>"; optional data-model-tilt (deg, like CSS rotate) and data-model-fit (× slot height).
 * The travelling stick's variant comes from the bestseller stop's data-model-variant.
 *
 * Elements marked data-model-static="" get a stick of their own that stays in the slot
 * (variant from data-model-variant, size from data-model-fit).
 *
 * data-model-drag on a slot lets the pointer spin that stick; a slot inside a [data-model-hover]
 * element spins while that element is hovered.
 */
const STOPS = ["hero", "bestseller", "hand"];

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const attr = (el: HTMLElement, name: string, fallback: number) => Number(el.dataset[name] ?? fallback);
const isVariant = (value: string | undefined): value is SavaStickVariant => !!value && value in STICK_VARIANTS;

/**
 * The SAVA sticks on the home page, drawn by one fixed transparent canvas over the page.
 * The travelling stick goes from the hero (where it idles in a slow spin) into the middle bestseller
 * card and onto the open hand, facing front at each stop (the footer has its own stick, FooterModel);
 * each frame it measures the anchor slots and blends between them by scroll progress, so it
 * locks exactly into each slot. The other bestseller
 * cards hold sticks of their own. Static images stay in the slots for reduced motion / no WebGL.
 */
export default function HomeModel() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    // Loaded on demand so three.js stays out of the page's first bundle
    createStickStage(canvas).then(async (stage) => {
      const anchors = STOPS.map((name) => document.querySelector<HTMLElement>(`[data-model-anchor="${name}"]`)).filter(
        (el): el is HTMLElement => el !== null,
      );
      const slots = Array.from(document.querySelectorAll<HTMLElement>("[data-model-static]")).filter((el) =>
        isVariant(el.dataset.modelVariant),
      );
      if (!stage) return; // No WebGL — the static images stay
      if (disposed || (anchors.length === 0 && slots.length === 0)) {
        stage.dispose();
        return;
      }
      const { build, fitScale } = stage;

      const travellerVariant = anchors[1]?.dataset.modelVariant;
      const [traveller, ...statics] = await Promise.all([
        anchors.length ? build(isVariant(travellerVariant) ? travellerVariant : "balanced") : null,
        ...slots.map((slot) => build(slot.dataset.modelVariant as SavaStickVariant)),
      ]);
      const fixed = slots.map((slot, i) => ({ slot, stick: statics[i] as Stick }));

      // The travelling stick holds back until the home intro clears, then rises and spins into place
      const entrance = { value: 0 };
      let entranceTween: gsap.core.Tween | undefined;
      const offEntrance = onIntroDone(() => {
        entranceTween = gsap.to(entrance, { value: 1, duration: 1.8, ease: "expo.out", delay: 0.35 });
      });

      // Which stick each drag handle / hover area drives
      const dragOwners = new Map<Element, Turntable>();
      const hoverOwners = new Map<Element, Turntable[]>();
      const own = (slot: HTMLElement, state: Turntable) => {
        if (slot.dataset.modelDrag !== undefined) dragOwners.set(slot, state);
        const area = slot.closest("[data-model-hover]");
        if (area) hoverOwners.set(area, [...(hoverOwners.get(area) ?? []), state]);
      };
      if (traveller) anchors.forEach((anchor) => own(anchor, traveller.state));
      fixed.forEach(({ slot, stick }) => own(slot, stick.state));

      const hoverHandlers = [...hoverOwners].map(([area, states]) => {
        const enter = () => states.forEach((s) => (s.hovered = true));
        const leave = () => states.forEach((s) => (s.hovered = false));
        area.addEventListener("pointerenter", enter);
        area.addEventListener("pointerleave", leave);
        return () => {
          area.removeEventListener("pointerenter", enter);
          area.removeEventListener("pointerleave", leave);
        };
      });

      // Segment i runs from stop i to stop i+1, ending when stop i+1 is centred in the viewport — or at
      // the page's bottom, for a stop too near the end to ever get there
      const triggers: ScrollTrigger[] = [];
      anchors.slice(1).forEach((el, i) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: i === 0 ? 0 : () => triggers[i - 1].end,
            end: () => {
              const centred =
                el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2 - window.innerHeight / 2;
              return Math.min(centred, ScrollTrigger.maxScroll(window));
            },
          }),
        );
      });
      const progress = triggers.map(() => 0);

      // Drag to spin (with inertia) and tip forward/back (springs back on release)
      let drag: { state: Turntable; x: number; y: number; t: number } | null = null;
      const onDown = (e: PointerEvent) => {
        const handle = (e.target as Element).closest?.("[data-model-drag]");
        const state = handle && dragOwners.get(handle);
        if (state) drag = { state, x: e.clientX, y: e.clientY, t: performance.now() };
      };
      const onMove = (e: PointerEvent) => {
        if (!drag) return;
        const { state } = drag;
        const now = performance.now();
        dragTurntable(state, e.clientX - drag.x, e.clientY - drag.y, now - drag.t);
        drag = { state, x: e.clientX, y: e.clientY, t: now };
      };
      const onUp = () => {
        if (drag) drag.state.tipTarget = 0;
        drag = null;
      };
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      const onScreen = (cy: number, h: number) => cy + h > -100 && cy - h < window.innerHeight + 100;

      let ready = false;
      const render = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs / 1000, 0.05);
        let visible = 0;

        if (traveller) {
          // Blend slot rects (and tilt / fit) along the path
          const first = anchors[0].getBoundingClientRect();
          let x = first.left;
          let y = first.top;
          let w = first.width;
          let h = first.height;
          let tiltDeg = attr(anchors[0], "modelTilt", 0);
          let fit = attr(anchors[0], "modelFit", 1);
          let journey = 0;
          let swing = 0;
          triggers.forEach((trigger, i) => {
            progress[i] = lerp(progress[i], trigger.progress, 0.14);
            const e = ease(progress[i]);
            const el = anchors[i + 1];
            const r = el.getBoundingClientRect();
            x = lerp(x, r.left, e);
            y = lerp(y, r.top, e);
            w = lerp(w, r.width, e);
            h = lerp(h, r.height, e);
            tiltDeg = lerp(tiltDeg, attr(el, "modelTilt", 0), e);
            fit = lerp(fit, attr(el, "modelFit", 1), e);
            journey += e;
            // Arc out to alternating sides mid-flight
            swing += Math.sin(Math.PI * e) * (i % 2 === 0 ? -1 : 1);
          });

          // Idle spin only in the hero: it fades out as the stick leaves for the next stop
          const inHero = triggers.length ? 1 - ease(progress[0]) : 1;
          const { state, tilt, spin } = traveller;
          turn(state, dt, inHero, drag?.state === state);

          const cx = x + w / 2 + swing * window.innerWidth * 0.12;
          const cy = y + h / 2 + (1 - entrance.value) * h * 0.35;
          tilt.visible = entrance.value > 0.001 && onScreen(cy, h);
          if (tilt.visible) {
            visible++;
            tilt.position.set(cx, -cy, 0);
            tilt.scale.setScalar(fitScale(traveller, w, h, fit) * entrance.value);
            tilt.rotation.set(state.tip, 0, (-tiltDeg * Math.PI) / 180);
            // A full turn per leg of the journey on top of its own spin, so it lands facing front
            spin.rotation.y = state.angle + journey * TURN - (1 - entrance.value) * Math.PI * 1.5;
          }
        }

        for (const { slot, stick } of fixed) {
          const { state, tilt, spin } = stick;
          turn(state, dt, 0, drag?.state === state);
          const r = slot.getBoundingClientRect();
          const cy = r.top + r.height / 2;
          tilt.visible = onScreen(cy, r.height);
          if (!tilt.visible) continue;
          visible++;
          tilt.position.set(r.left + r.width / 2, -cy, 0);
          tilt.scale.setScalar(fitScale(stick, r.width, r.height, attr(slot, "modelFit", 1)));
          tilt.rotation.set(state.tip, 0, 0);
          spin.rotation.y = state.angle;
        }

        if (!visible) {
          stage.clear();
          return; // Nothing on screen — skip the draw
        }
        stage.render();
        if (!ready) {
          ready = true;
          document.documentElement.dataset.model = "ready";
        }
      };
      gsap.ticker.add(render);
      ScrollTrigger.refresh();

      cleanup = () => {
        gsap.ticker.remove(render);
        offEntrance();
        entranceTween?.kill();
        triggers.forEach((trigger) => trigger.kill());
        hoverHandlers.forEach((off) => off());
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        delete document.documentElement.dataset.model;
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
