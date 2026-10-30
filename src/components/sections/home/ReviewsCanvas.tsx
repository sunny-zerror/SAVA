"use client";

import { useEffect, useRef, useState } from "react";
import { mountShaderCanvas, PLASMA_GLSL } from "@/lib/shader-canvas";
import { cn } from "@/utils/cn";

/*
 * The hero's aurora (PLASMA_GLSL) without the glass: just the broad bands of light, drifting at about
 * a third of the hero's pace and answering the pointer more gently, in deeper indigo → sky blue so
 * the section's white type stays legible. Grain comes from a CSS overlay in the section.
 */
const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;

  const vec3 INDIGO = vec3(0.208, 0.302, 0.588); // #354d96
  const vec3 ROYAL = vec3(0.263, 0.420, 0.749);  // #436bbf
  const vec3 SKY = vec3(0.353, 0.616, 0.886);    // #5a9de2
  const vec3 GLOW = vec3(0.580, 0.765, 0.937);   // #94c3ef

  ${PLASMA_GLSL}

  // Indigo in the troughs → royal → sky blue → a soft glow on the crests
  vec3 palette(float v) {
    vec3 col = mix(INDIGO, ROYAL, smoothstep(0.0, 0.35, v));
    col = mix(col, SKY, smoothstep(0.3, 0.7, v));
    return mix(col, GLOW, smoothstep(0.7, 1.0, v));
  }

  void main() {
    gl_FragColor = vec4(palette(plasma(gl_FragCoord.xy)), 1.0);
  }
`;

/** The hero runs its aurora at uTime = ms × 3e-4; this one a third as fast */
const TIME_SCALE = 1e-4;
/** How far the pointer shifts the bands (the hero uses 1.3) */
const POINTER_PULL = 0.6;

/**
 * Live aurora behind the reviews, reacting gently to the pointer. Fades in over the section's
 * static backdrop, which stays for reduced motion or no WebGL.
 */
export default function ReviewsCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    return mountShaderCanvas(
      canvas,
      (THREE) => {
        const uniforms = {
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2() },
          uResolution: { value: new THREE.Vector2(1, 1) },
        };
        const target = new THREE.Vector2();

        return {
          fragmentShader,
          uniforms,
          resize: (size) => uniforms.uResolution.value.copy(size),
          pointer: (x, y) => target.set(x * POINTER_PULL, y * POINTER_PULL),
          frame: (ms) => {
            uniforms.uTime.value = ms * TIME_SCALE;
            // Eased more softly than the hero's 0.15, so the bands glide after the pointer
            uniforms.uMouse.value.lerp(target, 0.05);
          },
        };
      },
      () => setReady(true),
    );
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={cn("transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0", className)}
    />
  );
}
