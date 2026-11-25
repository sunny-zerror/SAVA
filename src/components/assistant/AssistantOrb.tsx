"use client";

import { useEffect, useRef } from "react";
import { smoothLevel } from "@/lib/assistant/dictation";
import { paintAssistantOrb, readAssistantPalette } from "@/lib/assistant/painter";
import { gsap } from "@/lib/gsap";
import type { AssistantPhase } from "@/store/assistant-store";

/** Each phase's pace and brightness: calm while listening, quick while thinking, dim asleep */
const MOTION: Record<AssistantPhase, { speed: number; intensity: number }> = {
  idle: { speed: 0.6, intensity: 0.85 },
  entering: { speed: 1.4, intensity: 1 },
  listening: { speed: 1, intensity: 1 },
  thinking: { speed: 2.2, intensity: 1 },
  replying: { speed: 1.6, intensity: 1 },
  dictating: { speed: 1.3, intensity: 1 },
  sleeping: { speed: 0.35, intensity: 0.55 },
  exiting: { speed: 1.4, intensity: 1 },
};

/** How far the orb swells: with the microphone while dictating, a pulse while thinking, the beat of a reply */
function swellFor(phase: AssistantPhase, clock: number, mic: number) {
  if (phase === "dictating") return mic;
  if (phase === "thinking") return 0.18 + 0.18 * Math.sin(clock * 6);
  if (phase === "replying") return Math.max(0, 0.3 + 0.2 * Math.sin(clock * 9.1) + 0.15 * Math.sin(clock * 13.7 + 1.3));
  return 0;
}

interface AssistantOrbProps {
  phase: AssistantPhase;
  /** It draws only while the assistant is on screen */
  active: boolean;
  /** The microphone's level (0–1), written every frame while dictating */
  level: React.RefObject<number>;
}

/**
 * The assistant's orb: the launcher's gradient moving inside a lit sphere, drawn at half the frame
 * rate while `active`. Its pace and glow ease into each phase's; with reduced motion it holds still,
 * redrawn as the phase changes.
 */
export default function AssistantOrb({ phase, active, level }: AssistantOrbProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const phaseRef = useRef(phase);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !active) return;
    const colors = readAssistantPalette();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let size = 0;
    let clock = 0;
    let speed = 1;
    let intensity = 1;
    let swell = 0;
    let last = performance.now();
    let skip = false;

    const resize = () => {
      size = Math.max(1, Math.round(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.5)));
      canvas.width = canvas.height = size;
    };
    const paintStill = () =>
      paintAssistantOrb(ctx, colors, size, 1.5, { intensity: MOTION[phaseRef.current].intensity });

    const frame = () => {
      const motion = MOTION[phaseRef.current];
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      speed += (motion.speed - speed) * (1 - Math.exp(-dt / 0.4));
      intensity += (motion.intensity - intensity) * (1 - Math.exp(-dt / 0.6));
      // Time runs on through the skipped frames, so half the frame rate doesn't halve the pace
      clock += dt * speed;
      swell = smoothLevel(swell, swellFor(phaseRef.current, clock, level.current), dt, 0.08, 0.3);
      skip = !skip;
      if (!skip) paintAssistantOrb(ctx, colors, size, clock, { level: swell, intensity });
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (still) paintStill();
    });
    observer.observe(canvas);
    resize();
    if (still) {
      paintStill();
      return () => observer.disconnect();
    }
    gsap.ticker.add(frame);
    return () => {
      gsap.ticker.remove(frame);
      observer.disconnect();
    };
  }, [active, level]);

  // Held still (reduced motion): redrawn for each phase
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!active || !ctx || !canvas?.width || !window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    paintAssistantOrb(ctx, readAssistantPalette(), canvas.width, 1.5, { intensity: MOTION[phase].intensity });
  }, [phase, active]);

  return <canvas ref={ref} aria-hidden="true" className="block size-full" />;
}
