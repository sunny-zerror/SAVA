"use client";

import { useEffect, useRef, useState } from "react";
import { mountShaderCanvas, PLASMA_GLSL } from "@/lib/shader-canvas";
import { cn } from "@/utils/cn";

/*
 * The SAVA aurora (PLASMA_GLSL, src/lib/shader-canvas.ts) mapped across shades of the brand blue.
 *
 * The plasma is seen through fluted glass: vertical ribs that each refract a slice of it, with a
 * dark groove at the seams and a sheen down one side. Near the pointer the ribs refract harder,
 * catch more light and swing sideways with the pointer's speed.
 */
const fragmentShader = /* glsl */ `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec2 uResolution;
  uniform vec2 uPointer;   // eased pointer, drawing-buffer px (y up)
  uniform float uHover;    // 0–1, pointer present over the page
  uniform float uVelocity; // eased horizontal pointer speed, in ribs per frame
  uniform float uRib;      // rib width, drawing-buffer px

  // Shades of the SAVA brand blue (accent #709fcb) — one hue, no navy
  const vec3 DEEP = vec3(0.227, 0.416, 0.604);  // #3a6a9a
  const vec3 MID = vec3(0.329, 0.525, 0.722);   // #5486b8
  const vec3 BRAND = vec3(0.439, 0.624, 0.796); // #709fcb
  const vec3 LIGHT = vec3(0.639, 0.765, 0.886); // #a3c3e2

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  ${PLASMA_GLSL}

  // Deep brand blue in the troughs → brand blue → light on the crests
  vec3 palette(float v) {
    vec3 col = mix(DEEP, MID, smoothstep(0.0, 0.35, v));
    col = mix(col, BRAND, smoothstep(0.3, 0.7, v));
    return mix(col, LIGHT, smoothstep(0.65, 1.0, v));
  }

  void main() {
    vec2 p = gl_FragCoord.xy;
    float rib = floor(p.x / uRib);
    float local = fract(p.x / uRib); // 0–1 across one rib
    float lens = local - 0.5;

    // Pointer influence: tall so whole ribs light up, narrow across them
    vec2 d = (p - uPointer) / uResolution.y;
    float near = exp(-(d.x * d.x * 14.0 + d.y * d.y * 1.8)) * uHover;

    // Each rib shows a stretched slice of the plasma; harder refraction and a swing near the pointer
    vec2 q = p;
    q.x += lens * uRib * (2.5 + near * 5.0);
    q.x -= uVelocity * near * uRib * 2.0;
    q.y += lens * lens * uRib * near * 6.0;

    float v = plasma(q);
    v += (hash(vec2(rib, 7.0)) - 0.5) * 0.08; // per-rib brightness, like streaked glass
    v += near * 0.15;
    vec3 col = palette(clamp(v, 0.0, 1.0));

    // Dark groove at the seams, sheen down the left of each rib
    float groove = 1.0 - smoothstep(0.0, 0.08, min(local, 1.0 - local));
    col *= 1.0 - groove * (0.12 + near * 0.12);
    float sheen = exp(-pow((local - 0.28) * 7.0, 2.0));
    col += LIGHT * sheen * (0.05 + near * 0.25);

    // Fine film grain, like the print plate
    col += (hash(gl_FragCoord.xy + fract(uTime * 100.0) * 317.0) - 0.5) * 0.05;
    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Width of one glass rib, in CSS px */
const RIB_WIDTH = 26;

/**
 * Live WebGL background for the hero, reacting to the pointer. Sits over the static plate,
 * which stays visible until the first frame (and for reduced motion or no WebGL).
 */
export default function HeroCanvas({ className }: { className?: string }) {
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
          uPointer: { value: new THREE.Vector2() },
          uHover: { value: 0 },
          uVelocity: { value: 0 },
          uRib: { value: RIB_WIDTH },
        };
        // Pointer in drawing-buffer pixels (y up); the shader's phases and the ribs ease toward it
        const target = new THREE.Vector2();
        const pointerTarget = new THREE.Vector2();
        let hoverTarget = 0;

        return {
          fragmentShader,
          uniforms,
          resize: (size, scale) => {
            uniforms.uResolution.value.copy(size);
            uniforms.uRib.value = RIB_WIDTH * scale;
          },
          pointer: (x, y) => {
            target.set(x * 1.3, y * 1.3);
            pointerTarget.set(x, y);
            hoverTarget = 1;
          },
          leave: () => {
            hoverTarget = 0;
          },
          frame: (ms) => {
            uniforms.uTime.value = ms * 3e-4;
            uniforms.uMouse.value.lerp(target, 0.15);
            const prevX = uniforms.uPointer.value.x;
            uniforms.uPointer.value.lerp(pointerTarget, 0.12);
            const speed = (uniforms.uPointer.value.x - prevX) / uniforms.uRib.value;
            uniforms.uVelocity.value += (Math.max(-3, Math.min(3, speed)) - uniforms.uVelocity.value) * 0.1;
            uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.05;
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
