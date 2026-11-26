"use client";

import { useEffect, useRef, useState } from "react";
import { createOrbScene, type OrbPhase, type OrbScene } from "@/lib/assistant/orb-scene";
import { paintAssistantOrb, readAssistantPalette } from "@/lib/assistant/painter";
import { gsap } from "@/lib/gsap";
import type { AssistantPhase } from "@/store/assistant-store";

/** The orb's look for each of the assistant's phases (a reply is the orb "speaking"; dictation, listening) */
const LOOK: Record<AssistantPhase, OrbPhase> = {
  idle: "idle",
  entering: "entering",
  listening: "listening",
  thinking: "thinking",
  replying: "speaking",
  dictating: "listening",
  sleeping: "sleeping",
  exiting: "exiting",
};

/** A reply's beat (0–1), standing in for a voice's level: it drives the orb's swell and ripple */
const replyLevel = (t: number) => Math.max(0, 0.45 + 0.3 * Math.sin(t * 9.1) + 0.2 * Math.sin(t * 13.7 + 1.3));

interface AssistantOrbProps {
  phase: AssistantPhase;
  /** It draws only while the assistant is on screen */
  active: boolean;
  /** The microphone's level (0–1), written every frame while dictating */
  level: React.RefObject<number>;
}

/**
 * The assistant's orb, in three.js (src/lib/assistant/orb-scene.ts, after emotion-agency.com's): a
 * raymarched volume in a sphere, ringed by a corona, swelling with the microphone or a reply, a
 * comet circling while it thinks, leaning toward the pointer. Its canvas runs half as large again
 * as the orb's box, for the corona and glow. It draws while `active`; with reduced motion it holds
 * still, redrawn as the phase changes. Without WebGL the 2D painter's orb stands in.
 */
export default function AssistantOrb({ phase, active, level }: AssistantOrbProps) {
  const gl = useRef<HTMLCanvasElement>(null);
  const flat = useRef<HTMLCanvasElement>(null);
  const orb = useRef<OrbScene | null>(null);
  // Which renderer it ended up with: three.js, or the 2D fallback without WebGL
  const [ready, setReady] = useState<"pending" | "gl" | "flat">("pending");
  const phaseRef = useRef(phase);
  const still = useRef(false);

  // The scene lives as long as the overlay, so reopening doesn't recompile its shaders
  useEffect(() => {
    const canvas = gl.current;
    if (!canvas) return;
    still.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let observer: ResizeObserver | undefined;
    createOrbScene(canvas).then((scene) => {
      if (!scene) return setReady("flat");
      if (disposed) return scene.dispose();
      orb.current = scene;
      scene.setPhase(LOOK[phaseRef.current], true);
      observer = new ResizeObserver(() => {
        scene.resize();
        if (still.current) scene.render();
      });
      observer.observe(canvas);
      scene.update(0);
      scene.render();
      setReady("gl");
    });
    return () => {
      disposed = true;
      observer?.disconnect();
      orb.current?.dispose();
      orb.current = null;
    };
  }, []);

  useEffect(() => {
    phaseRef.current = phase;
    const scene = orb.current;
    if (!scene) return;
    scene.setPhase(LOOK[phase], still.current);
    if (still.current) {
      scene.update(0);
      scene.render();
    }
  }, [phase, ready]);

  // Its frames, while on screen
  useEffect(() => {
    if (!active || ready !== "gl" || still.current) return;
    let clock = 0;
    const frame = (_time: number, deltaMs: number) => {
      const scene = orb.current;
      if (!scene) return;
      const dt = Math.min(0.1, deltaMs / 1000);
      clock += dt;
      const current = phaseRef.current;
      const reply = current === "replying" ? replyLevel(clock) : 0;
      scene.setVoice(current === "dictating" ? level.current : 0, reply, reply);
      scene.update(dt);
      scene.render();
    };
    gsap.ticker.add(frame);
    return () => gsap.ticker.remove(frame);
  }, [active, ready, level]);

  // No WebGL: the 2D painter's orb
  useEffect(() => {
    const canvas = flat.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !active || ready !== "flat") return;
    const colors = readAssistantPalette();
    const size = () => {
      canvas.width = canvas.height = Math.max(1, Math.round(canvas.clientWidth * Math.min(devicePixelRatio || 1, 1.5)));
    };
    size();
    if (still.current) {
      paintAssistantOrb(ctx, colors, canvas.width, 1.5, {});
      return;
    }
    let clock = 0;
    const frame = (_time: number, deltaMs: number) => {
      clock += deltaMs / 1000;
      paintAssistantOrb(ctx, colors, canvas.width, clock, {});
    };
    gsap.ticker.add(frame);
    return () => gsap.ticker.remove(frame);
  }, [active, ready]);

  return (
    <div aria-hidden="true" className="relative size-full">
      <canvas
        ref={gl}
        className="pointer-events-none absolute -inset-1/4 block size-[150%] data-flat:hidden"
        data-flat={ready === "flat" || undefined}
      />
      {ready === "flat" && <canvas ref={flat} className="block size-full" />}
    </div>
  );
}
