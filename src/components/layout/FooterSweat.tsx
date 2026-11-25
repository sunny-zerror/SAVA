"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/utils/cn";

/** The skin under the sweat (public/images/footer/) */
const SKIN = "/images/footer/bg_skin_texture.png";

type Rgb = readonly [number, number, number];

interface Drop {
  x: number;
  y: number;
  r: number;
  /** Its slide speed (px/s) when it's moving */
  speed: number;
  /** Its own rhythm of sticking and slipping, so drops don't move in step */
  rate: number;
  phase: number;
}

/**
 * One soft patch of the torch's light. Together they make the beam: a hot centre, the spill round it,
 * patches drifting off-centre and flecks at the rim, so its edge is never a clean circle. Each follows
 * the pointer at its own pace, so a moving beam smears out behind itself.
 */
interface Lobe {
  x: number;
  y: number;
  /** Where it sits round the centre (radians), and how it turns */
  angle: number;
  spin: number;
  /** Its distance from the centre and its size, as fractions of the beam's radius */
  dist: number;
  size: number;
  /** How much darkness it lifts at its middle (0–1) */
  alpha: number;
  /** How quickly it catches up with the pointer */
  pace: number;
  /** Its own breathing in and out */
  sway: number;
  phase: number;
}

const TAU = Math.PI * 2;
/** How much faster sweat runs inside the light */
const LIT_SURGE = 4;
/** The dark everywhere the light isn't */
const AMBIENT = 0.86;
/** The dark and the glow are soft, so they're drawn at half size and scaled up */
const LIGHT_SCALE = 0.5;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const rgba = ([r, g, b]: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`;

/** A colour token as RGB (the tokens are hex) */
function token(name: string, fallback: string): Rgb {
  let hex = (getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback).replace("#", "");
  if (hex.length === 3) hex = [...hex].map((d) => d + d).join("");
  const n = Number.parseInt(hex, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** A bead of sweat at (x, y): a soft shadow, a clear body darkening to its rim, light caught low, a glint */
function paintBead(c: CanvasRenderingContext2D, light: Rgb, dark: Rgb, x: number, y: number, r: number) {
  c.fillStyle = rgba(dark, 0.3);
  c.beginPath();
  c.ellipse(x + r * 0.15, y + r * 0.4, r * 1.05, r, 0, 0, TAU);
  c.fill();

  const body = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  body.addColorStop(0, rgba(light, 0.22));
  body.addColorStop(0.6, rgba(light, 0.05));
  body.addColorStop(1, rgba(dark, 0.32));
  c.fillStyle = body;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();

  c.strokeStyle = rgba(light, 0.35);
  c.lineWidth = Math.max(0.5, r * 0.12);
  c.beginPath();
  c.arc(x, y, r * 0.82, Math.PI * 0.2, Math.PI * 0.8);
  c.stroke();

  c.fillStyle = rgba(light, 0.95);
  c.beginPath();
  c.ellipse(x - r * 0.35, y - r * 0.4, r * 0.26, r * 0.18, -0.6, 0, TAU);
  c.fill();
}

/** The beam's patches, scattered afresh for each footer */
function makeLobes(): Lobe[] {
  const lobe = (dist: number, size: number, alpha: number, pace: number, angle = rand(0, TAU)): Lobe => ({
    x: 0,
    y: 0,
    angle,
    spin: rand(-0.35, 0.35),
    dist,
    size,
    alpha,
    pace,
    sway: rand(0.4, 1.1),
    phase: rand(0, TAU),
  });
  return [
    // The hot centre, and the spill round it
    lobe(0, 0.55, 0.95, 16),
    lobe(0.06, 1, 0.5, 12),
    // Patches drifting off-centre, a little behind the pointer
    ...Array.from({ length: 5 }, (_, i) =>
      lobe(rand(0.22, 0.42), rand(0.5, 0.72), rand(0.42, 0.62), rand(5, 9), (i / 5) * TAU + rand(-0.4, 0.4)),
    ),
    // Flecks at the rim, so the edge is ragged
    ...Array.from({ length: 6 }, () => lobe(rand(0.72, 0.95), rand(0.16, 0.28), rand(0.18, 0.32), rand(4, 7))),
  ];
}

/**
 * The footer's background: skin in the dark, glistening with sweat. Beads stick and slip down it,
 * leaving wet trails that dry. Moving the pointer shines a torch on it: an uneven beam that drifts and
 * trails as it moves, where the skin shows warm and the sweat runs faster. Drawn only while the footer
 * is on screen; with reduced motion the sweat holds still (the light still follows). Put it as the
 * footer's first child.
 */
export default function FooterSweat({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const beadsRef = useRef<HTMLCanvasElement>(null);
  const sweatRef = useRef<HTMLCanvasElement>(null);
  const shadeRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);
  // Until the dark is drawn, a plain one stands in, so the bare skin never flashes up first
  const [ready, setReady] = useState(false);
  // The hint goes once the light has been found
  const [lit, setLit] = useState(false);

  useEffect(() => {
    const root = host.current;
    const footer = root?.parentElement;
    const canvases = [beadsRef.current, sweatRef.current, shadeRef.current, glowRef.current];
    if (!root || !footer || canvases.some((c) => !c)) return;
    const [beadCanvas, sweatCanvas, shadeCanvas, glowCanvas] = canvases as HTMLCanvasElement[];
    const beads = beadCanvas.getContext("2d")!;
    const sweat = sweatCanvas.getContext("2d")!;
    const shade = shadeCanvas.getContext("2d")!;
    const glow = glowCanvas.getContext("2d")!;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const light = token("--color-paper", "#ffffff");
    const dark = token("--color-night", "#08080a");

    let width = 0;
    let height = 0;
    let dpr = 1;
    const trail = document.createElement("canvas");
    const trails = trail.getContext("2d")!;
    let drops: Drop[] = [];
    let clock = 0;
    let running = false;
    // The torch: where it points, where the pointer is, how far it's on (0–1), and its patches
    const lamp = { x: 0, y: 0, tx: 0, ty: 0, on: 0, target: 0, radius: 260 };
    const lobes = makeLobes();

    const spawn = (anywhere: boolean): Drop => {
      const r = rand(2.2, 5.6);
      return {
        x: rand(0, width),
        y: anywhere ? rand(-height * 0.2, height) : rand(-80, -10),
        r,
        speed: rand(16, 34) * (r / 4),
        rate: rand(0.6, 1.6),
        phase: rand(0, TAU),
      };
    };

    /** How lit (0–1) a point is, from the beam's patches */
    const lightAt = (x: number, y: number) => {
      if (lamp.on < 0.01) return 0;
      let sum = 0;
      for (const lobe of lobes) {
        const reach = lobe.size * lamp.radius;
        sum += lobe.alpha * Math.max(0, 1 - Math.hypot(x - lobe.x, y - lobe.y) / reach);
      }
      return Math.min(1, sum) * lamp.on;
    };

    // Each patch drifts round the centre, breathes, and catches up with the pointer at its own pace
    const moveLobes = (dt: number, snap: boolean) => {
      for (const lobe of lobes) {
        lobe.angle += lobe.spin * dt;
        const dist = lobe.dist * (1 + 0.18 * Math.sin(clock * lobe.sway + lobe.phase)) * lamp.radius;
        // A beam meets the surface at a slant: a little wider than tall
        const tx = lamp.x + Math.cos(lobe.angle) * dist;
        const ty = lamp.y + Math.sin(lobe.angle) * dist * 0.82;
        const follow = snap ? 1 : 1 - Math.exp(-dt * lobe.pace);
        lobe.x += (tx - lobe.x) * follow;
        lobe.y += (ty - lobe.y) * follow;
      }
    };

    const drawSweat = () => {
      sweat.clearRect(0, 0, width, height);
      sweat.drawImage(trail, 0, 0, width, height);
      for (const d of drops) paintBead(sweat, light, dark, d.x, d.y, d.r);
    };

    // The dark, with the beam lifted out of it, and the beam's warmth on the skin
    const drawLight = () => {
      const on = lamp.on * (still ? 1 : 0.96 + 0.04 * Math.sin(clock * 13.1) * Math.sin(clock * 7.3));
      shade.globalCompositeOperation = "source-over";
      shade.clearRect(0, 0, width, height);
      shade.fillStyle = rgba(dark, AMBIENT);
      shade.fillRect(0, 0, width, height);
      glow.clearRect(0, 0, width, height);
      if (on < 0.01) return;
      shade.globalCompositeOperation = "destination-out";
      for (const lobe of lobes) {
        const reach = lobe.size * lamp.radius;
        const a = lobe.alpha * on;
        const lift = shade.createRadialGradient(lobe.x, lobe.y, 0, lobe.x, lobe.y, reach);
        lift.addColorStop(0, `rgba(0, 0, 0, ${a})`);
        lift.addColorStop(0.45, `rgba(0, 0, 0, ${a * 0.7})`);
        lift.addColorStop(0.8, `rgba(0, 0, 0, ${a * 0.22})`);
        lift.addColorStop(1, "rgba(0, 0, 0, 0)");
        shade.fillStyle = lift;
        shade.fillRect(lobe.x - reach, lobe.y - reach, reach * 2, reach * 2);

        const warmth = glow.createRadialGradient(lobe.x, lobe.y, 0, lobe.x, lobe.y, reach);
        warmth.addColorStop(0, rgba(light, a * 0.32));
        warmth.addColorStop(1, rgba(light, 0));
        glow.fillStyle = warmth;
        glow.fillRect(lobe.x - reach, lobe.y - reach, reach * 2, reach * 2);
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = root.clientWidth;
      height = root.clientHeight;
      for (const c of [beadCanvas, sweatCanvas, trail]) {
        c.width = Math.round(width * dpr);
        c.height = Math.round(height * dpr);
      }
      for (const c of [shadeCanvas, glowCanvas]) {
        c.width = Math.round(width * LIGHT_SCALE);
        c.height = Math.round(height * LIGHT_SCALE);
      }
      for (const c of [beads, sweat, trails]) c.setTransform(dpr, 0, 0, dpr, 0, 0);
      for (const c of [shade, glow]) c.setTransform(LIGHT_SCALE, 0, 0, LIGHT_SCALE, 0, 0);

      // Still beads dotted over the skin
      beads.clearRect(0, 0, width, height);
      const count = (width * height) / 4500;
      for (let i = 0; i < count; i++) paintBead(beads, light, dark, rand(0, width), rand(0, height), rand(0.9, 3.2));

      drops = Array.from({ length: Math.round(Math.min(90, Math.max(28, (width * height) / 16000))) }, () =>
        spawn(true),
      );
      lamp.radius = Math.max(170, Math.min(300, width * 0.2));
      drawSweat();
      drawLight();
      setReady(true);
    };

    const step = (_time: number, deltaMs: number) => {
      const dt = Math.min(0.05, deltaMs / 1000);
      clock += dt;
      lamp.x += (lamp.tx - lamp.x) * (1 - Math.exp(-dt * 12));
      lamp.y += (lamp.ty - lamp.y) * (1 - Math.exp(-dt * 12));
      lamp.on += (lamp.target - lamp.on) * (1 - Math.exp(-dt * 4));
      moveLobes(dt, false);

      // The trails dry
      trails.globalCompositeOperation = "destination-out";
      trails.fillStyle = `rgba(0, 0, 0, ${0.22 * dt})`;
      trails.fillRect(0, 0, width, height);
      trails.globalCompositeOperation = "source-over";
      trails.lineCap = "round";

      for (const d of drops) {
        // Sweat sticks, then slips: each drop pauses and runs to its own rhythm, and faster in the light
        const slip = 0.25 + 0.75 * Math.max(0, Math.sin(clock * d.rate + d.phase));
        const dy = d.speed * slip * (1 + LIT_SURGE * lightAt(d.x, d.y)) * dt;
        const dx = Math.sin(clock * 1.7 + d.phase) * 0.12 * dy;
        trails.strokeStyle = rgba(light, 0.07);
        trails.lineWidth = d.r * 0.9;
        trails.beginPath();
        trails.moveTo(d.x, d.y);
        d.x += dx;
        d.y += dy;
        trails.lineTo(d.x, d.y);
        trails.stroke();
        if (d.y - d.r > height) Object.assign(d, spawn(false));
      }
      drawSweat();
      drawLight();
    };

    const onMove = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      lamp.tx = event.clientX - rect.left;
      lamp.ty = event.clientY - rect.top;
      // The light comes on where the pointer arrives, rather than sweeping in from the corner
      const arriving = lamp.on < 0.05;
      if (arriving || still) {
        lamp.x = lamp.tx;
        lamp.y = lamp.ty;
        moveLobes(0, true);
      }
      lamp.target = 1;
      setLit(true);
      if (still) {
        lamp.on = 1;
        drawLight();
      }
    };
    const onLeave = () => {
      lamp.target = 0;
      if (still) {
        lamp.on = 0;
        drawLight();
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(root);
    // Only while it's on screen
    const visibility = new IntersectionObserver(([entry]) => {
      if (still || entry.isIntersecting === running) return;
      running = entry.isIntersecting;
      if (running) gsap.ticker.add(step);
      else gsap.ticker.remove(step);
    });
    visibility.observe(root);
    footer.addEventListener("pointermove", onMove);
    footer.addEventListener("pointerleave", onLeave);

    return () => {
      observer.disconnect();
      visibility.disconnect();
      if (running) gsap.ticker.remove(step);
      footer.removeEventListener("pointermove", onMove);
      footer.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={host} aria-hidden="true" className={cn("overflow-hidden", className)}>
      <Image src={SKIN} alt="" fill sizes="100vw" className="object-cover" />
      <canvas ref={beadsRef} className="absolute inset-0 size-full" />
      <canvas ref={sweatRef} className="absolute inset-0 size-full" />
      {/* The dark with the torch's beam lifted out of it, and the beam's warmth on the skin */}
      <canvas ref={shadeRef} className="absolute inset-0 size-full" />
      <canvas ref={glowRef} className="absolute inset-0 size-full mix-blend-soft-light" />
      {!ready && <div className="absolute inset-0 bg-night/86" />}
      <div className="absolute inset-0 bg-grain opacity-10 mix-blend-overlay" />
      <p
        className={cn(
          "absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-center text-kicker text-paper/50 transition-opacity duration-700 pointer-fine:flex",
          lit ? "opacity-0" : "opacity-100",
        )}
      >
        Move your cursor to see the sweat
      </p>
    </div>
  );
}
