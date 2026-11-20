"use client";

import { useEffect, useRef } from "react";
import type { Vector3 } from "three";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { type SavaStickVariant, STICK_VARIANTS } from "@/lib/sava-stick";
import { createStickStage, type Stick } from "@/lib/stick-stage";
import { drag as dragTurntable, lerp, turn, TURN, turntable } from "@/lib/turntable";

/*
 * Keyframes along the page: elements marked data-stick="<name>" (the name only labels the markup).
 * Each is a slot — the stick fills its height (× data-stick-fit), centred on it — and a pose:
 *   data-stick-tilt     deg, like CSS rotate (turns it in the picture plane: lying on a table)
 *   data-stick-turn     turns about its own axis (0 = label to camera, 0.25 = side on)
 *   data-stick-pitch    deg; + tips its top towards the viewer (shows the cap), − away (the base)
 *   data-stick-cap      0–1, the cap lifted off and set aside
 *   data-stick-rise     0–1, the formula twisted up (the knob turns with it)
 *   data-stick-shadow   0–1, a contact shadow on the surface it lies on
 *   data-stick-idle     0–1, a slow idle spin
 *   data-stick-variant  the range it shows; a change spins it round into the new one
 *   data-stick-drag     the pointer can spin it here
 * A keyframe is reached when its slot is centred in the viewport — or, inside a ScrollTrack
 * (data-track), at data-stick-at (0–1) of the way through that track's pinned travel. Between two
 * keyframes the stick blends from one to the next on an ease — place, size and pose — so it flies
 * from slot to slot, turning, as the page scrolls. Slots are measured live, so it rides along with
 * a slot that scrolls; data-stick-fit="0" shrinks it away for the sections without it.
 */

const VARIANTS = Object.keys(STICK_VARIANTS) as SavaStickVariant[];
const isVariant = (value: string | undefined): value is SavaStickVariant => !!value && value in STICK_VARIANTS;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const DEG = Math.PI / 180;

/** How far the cap travels when it's off (model units, the stick ≈ 1.1 tall) and the formula rises */
const CAP_OFF = { x: 0.17, y: 0.3, tip: 0.55 };
const RISE = 0.085;
/** Knob turns for a full twist up */
const KNOB_TURNS = 3;

interface Keyframe {
  el: HTMLElement;
  /** The scroll position it's reached at */
  at: number;
}

function reachedAt(el: HTMLElement) {
  const track = el.closest<HTMLElement>("[data-track]");
  if (track) {
    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = Math.max(0, track.offsetHeight - window.innerHeight);
    return top + Number(el.dataset.stickAt ?? 0.5) * travel;
  }
  const r = el.getBoundingClientRect();
  return r.top + window.scrollY + r.height / 2 - window.innerHeight / 2;
}

function poseOf(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  const d = el.dataset;
  const n = (value: string | undefined, fallback = 0) => (value === undefined ? fallback : Number(value));
  return {
    x: r.left + r.width / 2,
    y: r.top + r.height / 2,
    w: r.width,
    h: r.height,
    fit: n(d.stickFit, 1),
    tilt: n(d.stickTilt),
    turn: n(d.stickTurn),
    pitch: n(d.stickPitch),
    cap: n(d.stickCap),
    rise: n(d.stickRise),
    shadow: n(d.stickShadow),
    idle: n(d.stickIdle),
  };
}

type Pose = ReturnType<typeof poseOf>;

/**
 * The /home page's SAVA stick: one fixed transparent canvas over the page, following the keyframes
 * above. All four ranges are built up front, so a range change is only a swap. Static sticks stay in
 * the slots (hidden once this is live, via html[data-model="ready"]) for reduced motion / no WebGL.
 */
export default function ExperienceStage() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    // Loaded on demand so three.js stays out of the page's first bundle
    createStickStage(canvas).then(async (stage) => {
      if (!stage) return; // No WebGL — the static sticks stay
      const keyframes: Keyframe[] = Array.from(document.querySelectorAll<HTMLElement>("[data-stick]")).map((el) => ({
        el,
        at: 0,
      }));
      if (disposed || keyframes.length === 0) {
        stage.dispose();
        return;
      }

      const built = await Promise.all(VARIANTS.map((variant) => stage.build(variant, { formula: true })));
      const sticks = Object.fromEntries(VARIANTS.map((variant, i) => [variant, built[i]])) as Record<
        SavaStickVariant,
        Stick
      >;
      const parts = Object.fromEntries(
        VARIANTS.map((variant) => {
          const { model } = sticks[variant];
          return [
            variant,
            {
              cap: model.getObjectByName("cap"),
              knob: model.getObjectByName("knob"),
              formula: model.getObjectByName("formula"),
            },
          ];
        }),
      ) as Record<SavaStickVariant, Record<"cap" | "knob" | "formula", ReturnType<Stick["model"]["getObjectByName"]>>>;
      const shadow = stage.shadow();
      // Compile every range's shaders now, so the first swap doesn't stall
      await stage.warm();
      if (disposed) {
        stage.dispose();
        return;
      }

      const measure = () => {
        keyframes.forEach((keyframe) => (keyframe.at = reachedAt(keyframe.el)));
        keyframes.sort((a, b) => a.at - b.at);
      };
      measure();
      ScrollTrigger.addEventListener("refresh", measure);

      // A range change: one quick turn, swapping sticks as it passes edge-on, with a slight dip in size
      const first = keyframes[0].el.dataset.stickVariant;
      let shown: SavaStickVariant = isVariant(first) ? first : "balanced";
      const swap = { p: 0, to: shown, running: false };
      let swapTween: gsap.core.Tween | undefined;

      // Drag to spin (with inertia) and tip, where a slot allows it
      const spin = turntable();
      let drag: { x: number; y: number; t: number } | null = null;
      const onDown = (e: PointerEvent) => {
        if ((e.target as Element).closest?.("[data-stick-drag]"))
          drag = { x: e.clientX, y: e.clientY, t: performance.now() };
      };
      const onMove = (e: PointerEvent) => {
        if (!drag) return;
        const now = performance.now();
        dragTurntable(spin, e.clientX - drag.x, e.clientY - drag.y, now - drag.t);
        drag = { x: e.clientX, y: e.clientY, t: now };
      };
      const onUp = () => {
        if (drag) spin.tipTarget = 0;
        drag = null;
      };
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      let scroll = window.scrollY;
      const render = (_time: number, deltaMs: number) => {
        const dt = Math.min(deltaMs / 1000, 0.05);
        // A touch of extra smoothing on top of Lenis, so the stick glides rather than tracks
        scroll = lerp(scroll, window.scrollY, 1 - Math.exp(-dt * 14));

        // The segment we're in: from the last keyframe reached to the next
        let i = 0;
        while (i < keyframes.length - 1 && keyframes[i + 1].at <= scroll) i++;
        const from = keyframes[i];
        const to = keyframes[Math.min(i + 1, keyframes.length - 1)];
        const span = to.at - from.at;
        const e = span > 0 ? ease(clamp01((scroll - from.at) / span)) : 0;
        const a = poseOf(from.el);
        const b = to === from ? a : poseOf(to.el);
        const mix = (key: keyof Pose) => lerp(a[key], b[key], e);

        const wanted = (e < 0.5 ? from : to).el.dataset.stickVariant;
        if (!swap.running && isVariant(wanted) && wanted !== shown) {
          swap.running = true;
          swap.to = wanted;
          swapTween = gsap.fromTo(
            swap,
            { p: 0 },
            {
              p: 1,
              duration: 0.9,
              ease: "power2.inOut",
              onComplete: () => {
                swap.running = false;
                swap.p = 0;
              },
            },
          );
        }
        if (swap.running && swap.p >= 0.5) shown = swap.to;

        turn(spin, dt, mix("idle"), drag !== null);

        const stick = sticks[shown];
        const dip = swap.running ? 1 - 0.16 * Math.sin(Math.PI * swap.p) : 1;
        const scale = stage.fitScale(stick, mix("w"), mix("h"), mix("fit")) * dip;
        const length = stick.size.y * scale;
        const cx = mix("x");
        const cy = mix("y");
        const visible = length > 2 && cy + length > -100 && cy - length < window.innerHeight + 100;
        for (const variant of VARIANTS) sticks[variant].tilt.visible = visible && variant === shown;

        const shadowStrength = mix("shadow");
        shadow.visible = visible && shadowStrength > 0.01;

        if (!visible) {
          stage.clear();
          return; // Nothing on screen — skip the draw
        }

        const tiltZ = -mix("tilt") * DEG;
        stick.tilt.position.set(cx, -cy, 0);
        stick.tilt.scale.setScalar(scale);
        stick.tilt.rotation.set(mix("pitch") * DEG + spin.tip, 0, tiltZ);
        stick.spin.rotation.y = mix("turn") * TURN + spin.angle + (swap.running ? swap.p * TURN : 0);

        // The cap lifts, swings out to the side and tips over, as a hand would set it down
        const { cap, knob, formula } = parts[shown];
        const off = mix("cap");
        if (cap) {
          const rest = cap.userData.rest as Vector3;
          cap.position.set(rest.x + off * CAP_OFF.x, rest.y + off * CAP_OFF.y, rest.z);
          cap.rotation.z = -off * CAP_OFF.tip;
        }
        const rise = mix("rise");
        if (formula) formula.position.y = rise * RISE;
        if (knob) knob.rotation.y = rise * KNOB_TURNS * TURN;

        if (shadow.visible) {
          // Lit from the upper left, so it falls a little down and to the right of the stick
          shadow.position.set(cx + length * 0.035, -(cy + length * 0.05), -4000);
          shadow.rotation.z = tiltZ;
          shadow.scale.set(stick.size.x * scale * 1.3, length * 1.1, 1);
          shadow.material.opacity = shadowStrength;
        }

        stage.render();
      };

      gsap.ticker.add(render);
      document.documentElement.dataset.model = "ready";
      ScrollTrigger.refresh();

      cleanup = () => {
        gsap.ticker.remove(render);
        ScrollTrigger.removeEventListener("refresh", measure);
        swapTween?.kill();
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
