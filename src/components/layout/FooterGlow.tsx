"use client";

import { useEffect, useRef, useState } from "react";
import { mountShaderCanvas } from "@/lib/shader-canvas";
import { cn } from "@/utils/cn";

/** The skin the footer shows (the same file as the image under it, which stands in until it's drawn) */
const SKIN = "/images/footer/bg_skin_texture.png";
/** Recent pointer positions that stay lit a moment after it moves on */
const TRAIL = 16;
/** Radius of the light around the pointer, in CSS px */
const RADIUS = 220;
/** How bright the skin is away from the pointer (1 = as photographed) */
const DIM = 0.2;

/*
 * The skin, drawn in WebGL at about two thirds of its brightness. Around the pointer it comes up to
 * full brightness, with the pores' own relief picked out in the light. Where the pointer has just
 * been stays a little brighter for a moment, then settles.
 */
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform vec2 uResolution;
  uniform float uScale;          // drawing-buffer px per CSS px
  uniform vec3 uHead;            // eased pointer (px, y up) and how present it is, 0–1
  uniform vec3 uTrail[${TRAIL}]; // where it has been, and how much light is left there
  uniform sampler2D uSkin;
  uniform vec2 uSkinSize;

  const float DIM = ${DIM.toFixed(2)};
  const vec3 LIGHT = vec3(-0.45, 0.55, 0.7); // from the top left, towards the viewer

  float luma(vec2 uv) {
    return dot(texture2D(uSkin, uv).rgb, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    vec2 p = gl_FragCoord.xy;
    float radius = ${RADIUS.toFixed(1)} * uScale;
    vec3 light = normalize(LIGHT);

    // The skin, laid out as object-cover like the image
    float cover = max(uResolution.x / uSkinSize.x, uResolution.y / uSkinSize.y);
    vec2 uv = (p - 0.5 * uResolution) / (uSkinSize * cover) + 0.5;
    vec3 skin = texture2D(uSkin, uv).rgb;

    // Brightness: full over the pointer, lingering where it has been, DIM elsewhere
    vec2 d = (p - uHead.xy) / radius;
    float lit = exp(-dot(d, d) * 2.2) * uHead.z;
    float dark = 1.0 - lit;
    for (int i = 0; i < ${TRAIL}; i++) {
      vec3 t = uTrail[i];
      if (t.z < 0.01) continue;
      vec2 e = (p - t.xy) / (radius * 0.8);
      dark *= 1.0 - exp(-dot(e, e) * 2.4) * t.z * 0.6;
    }
    lit = 1.0 - dark;

    // The pores' relief, by the brightness either side, where it's lit
    vec2 px = 1.5 * uScale / (uSkinSize * cover);
    float dx = luma(uv + vec2(px.x, 0.0)) - luma(uv - vec2(px.x, 0.0));
    float dy = luma(uv + vec2(0.0, px.y)) - luma(uv - vec2(0.0, px.y));
    vec3 pores = normalize(vec3(-dx * 6.0, -dy * 6.0, 1.0));

    // Shaded relative to flat skin, so nothing changes away from the light
    float shade = 1.0 + (dot(pores, light) - light.z) * lit;

    gl_FragColor = vec4(skin * mix(DIM, 1.05, lit) * shade, 1.0);
  }
`;

/** How much of what's laid over the skin (the sweat) shows away from the light */
const SEEN = 0.2;
/** Distances (in radii) a mask spot's falloff is sampled at; it's gone by the last */
const FALLOFF = [0, 0.35, 0.7, 1.05, 1.5];

/** One pool of light as a mask layer: the shader's exp(-k·r²) falloff, at CSS px x, y */
function spot(x: number, y: number, radius: number, strength: number, k: number) {
  const stops = FALLOFF.map((s, i) => {
    const alpha = i === FALLOFF.length - 1 ? 0 : strength * Math.exp(-k * s * s);
    return `rgb(0 0 0 / ${alpha.toFixed(3)}) ${(s * radius).toFixed(1)}px`;
  });
  return `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, ${stops.join(", ")})`;
}

interface FooterGlowProps {
  className?: string;
  /** What lies over the skin (the sweat): SEEN away from the light, fully where it's lit */
  children?: React.ReactNode;
}

/**
 * The footer's skin, dimmed, with a light that follows the pointer, and the sweat (children) over it
 * lit by the same light. Until the skin is drawn (and without WebGL) the plain image with a light
 * scrim stands in, and the sweat shows in full. On touch screens, where nothing hovers, the light
 * drifts slowly on its own.
 */
export default function FooterGlow({ className, children }: FooterGlowProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const over = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    const layer = over.current;
    if (!canvas || !layer) return;
    const drifts =
      window.matchMedia("(hover: none)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return mountShaderCanvas(
      canvas,
      (THREE) => {
        const uniforms = {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uScale: { value: 1 },
          uHead: { value: new THREE.Vector3() },
          uTrail: { value: Array.from({ length: TRAIL }, () => new THREE.Vector3()) },
          uSkin: { value: null as InstanceType<typeof THREE.Texture> | null },
          uSkinSize: { value: new THREE.Vector2(1672, 941) },
        };

        let disposed = false;
        new THREE.TextureLoader().load(SKIN, (texture) => {
          if (disposed) return texture.dispose();
          uniforms.uSkin.value = texture;
          uniforms.uSkinSize.value.set(texture.image.width, texture.image.height);
        });

        const target = new THREE.Vector2();
        let inside = false;
        let last = 0;
        let shown = false;
        let next = 0; // the trail slot to write next
        const dropped = new THREE.Vector2(); // where the last trail point went
        let mask = "";

        // The sweat's mask: SEEN everywhere, the head and the trail on top, combined (source-over) as
        // the shader combines them, so the sweat brightens exactly where the skin does
        const updateMask = () => {
          const { uHead, uTrail, uResolution, uScale } = uniforms;
          const s = uScale.value;
          const h = uResolution.value.y;
          const layers: string[] = [];
          const head = uHead.value;
          if (head.z > 0.01) layers.push(spot(head.x / s, (h - head.y) / s, RADIUS, head.z, 2.2));
          for (const t of uTrail.value) {
            if (t.z > 0.01) layers.push(spot(t.x / s, (h - t.y) / s, RADIUS * 0.8, t.z * 0.6, 2.4));
          }
          layers.push(`linear-gradient(rgb(0 0 0 / ${SEEN}), rgb(0 0 0 / ${SEEN}))`);
          const value = layers.join(", ");
          if (value === mask) return;
          mask = value;
          layer.style.maskImage = value;
        };

        return {
          fragmentShader,
          uniforms,
          resize: (size, scale) => {
            uniforms.uResolution.value.copy(size);
            uniforms.uScale.value = scale;
          },
          pointer: (x, y) => {
            const { x: w, y: h } = uniforms.uResolution.value;
            inside = x >= 0 && x <= w && y >= 0 && y <= h;
            if (inside) target.set(x, y);
          },
          leave: () => {
            inside = false;
          },
          frame: (ms) => {
            const dt = Math.min((ms - last) / 1000, 0.05);
            last = ms;
            const t = ms / 1000;
            const { uHead, uTrail, uResolution, uScale } = uniforms;
            const head = uHead.value;
            const { x: w, y: h } = uResolution.value;

            // Where the light goes: the pointer, or on touch screens a slow wander
            let presence = inside ? 1 : 0;
            if (!inside && drifts) {
              target.set(w * (0.5 + 0.32 * Math.sin(t * 0.21)), h * (0.5 + 0.3 * Math.sin(t * 0.33 + 1.2)));
              presence = 0.7;
            }
            // Rise where the pointer comes in rather than sliding over from the last spot
            if (head.z < 0.02 && presence > 0) head.set(target.x, target.y, head.z);
            head.x += (target.x - head.x) * 0.14;
            head.y += (target.y - head.y) * 0.14;
            head.z += (presence - head.z) * 0.08;

            // Leave a little light behind every so often along the way; each fades
            if (head.z > 0.05 && Math.hypot(head.x - dropped.x, head.y - dropped.y) > 24 * uScale.value) {
              uTrail.value[next].set(head.x, head.y, head.z);
              dropped.set(head.x, head.y);
              next = (next + 1) % TRAIL;
            }
            const fade = Math.exp(-dt * 2.5);
            for (const point of uTrail.value) point.z *= fade;

            // Show the canvas once the skin is on it, and from then dim the sweat with it
            if (uniforms.uSkin.value && !shown) {
              shown = true;
              requestAnimationFrame(() => setReady(true));
            }
            if (shown) updateMask();
          },
          dispose: () => {
            disposed = true;
            uniforms.uSkin.value?.dispose();
          },
        };
      },
      () => {},
    );
  }, []);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none", className)}>
      <div className={cn("absolute inset-0 bg-night/80 transition-opacity duration-700", ready && "opacity-0")} />
      <canvas
        ref={ref}
        className={cn(
          "absolute inset-0 size-full transition-opacity duration-700",
          ready ? "opacity-100" : "opacity-0",
        )}
      />
      <div ref={over} className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}
