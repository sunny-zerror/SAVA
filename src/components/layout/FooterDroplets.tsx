"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface Point {
  x: number;
  y: number;
}

/** A drop running down the surface */
interface Drop extends Point {
  r: number;
  vx: number;
  /** Its own slow pace, px per frame at 60fps */
  speed: number;
  /** Meander phase, so drops don't all sway together */
  seed: number;
  alpha: number;
  trail: Point[];
}

/** A still bead of sweat */
interface Bead extends Point {
  r: number;
  alpha: number;
}

interface Trail {
  points: Point[];
  width: number;
  life: number;
}

const REACH = 110; // px around the pointer that bends a drop's path
const SPRITE = 96; // px, the pre-drawn droplet every drop and bead is stamped from

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const rgb = (hex: string, alpha: number) => {
  // Theme colours can come back shortened (#fff)
  let digits = hex.trim().replace("#", "");
  if (digits.length === 3) digits = [...digits].map((d) => d + d).join("");
  const n = parseInt(digits, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** A clear water droplet lit from the top left: almost no body, a soft shadowed rim, light refracted into a
 * bright crescent along its lower edge, and a sharp glint up top */
function drawSprite(paper: string, ink: string) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE;
  const s = sprite.getContext("2d")!;
  const c = SPRITE / 2;
  const r = c - 4;

  // Body: clear in the middle, a touch denser toward the rim
  const body = s.createRadialGradient(c, c + r * 0.25, r * 0.2, c, c, r);
  body.addColorStop(0, rgb(paper, 0.14));
  body.addColorStop(0.75, rgb(paper, 0.03));
  body.addColorStop(1, rgb(ink, 0.22));
  s.fillStyle = body;
  s.beginPath();
  s.arc(c, c, r, 0, Math.PI * 2);
  s.fill();

  // Rim: shadowed on the lit side (top), thin all round
  const rim = s.createLinearGradient(0, c - r, 0, c + r);
  rim.addColorStop(0, rgb(ink, 0.45));
  rim.addColorStop(0.6, rgb(ink, 0.12));
  rim.addColorStop(1, rgb(ink, 0.02));
  s.strokeStyle = rim;
  s.lineWidth = 2.5;
  s.stroke();

  // Refracted light pooling in a crescent along the bottom
  s.strokeStyle = rgb(paper, 0.75);
  s.lineWidth = r * 0.16;
  s.lineCap = "round";
  s.beginPath();
  s.arc(c, c, r * 0.78, Math.PI * 0.2, Math.PI * 0.8);
  s.stroke();

  // Glint
  s.fillStyle = rgb(paper, 0.95);
  s.beginPath();
  s.ellipse(c - r * 0.38, c - r * 0.42, r * 0.17, r * 0.1, -0.7, 0, Math.PI * 2);
  s.fill();
  return sprite;
}

/**
 * Water on the footer, like sweat on skin: small beads sit still on the blue while drops keep forming
 * at the top and running slowly down, meandering a little, swallowing the beads in their way and
 * leaving a wet trail that dries off. The pointer pushes drops aside, so their paths bend round it
 * before they carry on down. Drawn on a canvas that fills the footer (pass its position in className);
 * it only animates while the footer is on screen. Reduced motion: still drops and beads.
 */
export default function FooterDroplets({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const styles = getComputedStyle(document.documentElement);
    const paper = styles.getPropertyValue("--color-paper") || "#ffffff";
    const ink = styles.getPropertyValue("--color-ink") || "#33332e";
    const sprite = drawSprite(paper, ink);

    let width = 0;
    let height = 0;
    let drops: Drop[] = [];
    let beads: Bead[] = [];
    let trails: Trail[] = [];

    const drop = (y: number): Drop => ({
      x: rand(0, width),
      y,
      r: rand(5, 9),
      vx: 0,
      speed: rand(0.35, 0.9),
      seed: Math.random() * 10,
      alpha: 0,
      trail: [],
    });
    const bead = (alpha = 1): Bead => ({
      x: rand(0, width),
      y: rand(0, height),
      r: 1.5 + Math.random() ** 2 * 4.5,
      alpha,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      width = host.clientWidth;
      height = host.clientHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Already spread down the footer, so it's wet from the first frame
      drops = Array.from({ length: Math.max(6, Math.round(width / 90)) }, () => ({
        ...drop(rand(0, height)),
        alpha: 1,
      }));
      beads = Array.from({ length: Math.min(180, Math.round((width * height) / 6000)) }, () => bead());
      trails = [];
      if (still) draw();
    };

    const stamp = (p: Point, r: number, alpha: number, stretch = 1) => {
      const d = r * 2;
      ctx.globalAlpha = alpha;
      // Stretched upward from its base, the water pooling at the bottom like a running drop's
      ctx.drawImage(sprite, p.x - r, p.y - r * (2 * stretch - 1), d, d * stretch);
    };

    const stroke = (points: Point[], lineWidth: number, alpha: number) => {
      if (points.length < 2) return;
      ctx.globalAlpha = alpha;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (const p of points) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = rgb(paper, 1);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (const t of trails) stroke(t.points, t.width, 0.1 * t.life);
      for (const d of drops) stroke(d.trail, d.r * 0.55, 0.12 * d.alpha);
      for (const b of beads) stamp(b, b.r, b.alpha);
      for (const d of drops) stamp(d, d.r, d.alpha, 1.35);
      ctx.globalAlpha = 1;
    };

    const pointer = { x: -1e4, y: -1e4 };

    const tick = (time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 16.67, 3);

      for (const d of drops) {
        d.alpha = Math.min(1, d.alpha + 0.02 * dt);

        // Bend round the pointer: pushed sideways, harder the closer it passes
        const dx = d.x - pointer.x;
        const dy = d.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REACH) d.vx += (dx >= 0 ? 1 : -1) * (1 - dist / REACH) ** 2 * 0.5 * dt;
        d.vx *= 0.94 ** dt;

        // Slow and steady, a gentle meander, held back a little while it's being pushed aside
        const pace = d.speed * (1 - Math.min(0.6, Math.abs(d.vx) * 0.25));
        d.y += pace * dt;
        d.x += (d.vx + Math.sin(time * 0.9 + d.seed) * 0.15) * dt;

        const tail = d.trail.at(-1);
        if (!tail || Math.hypot(d.x - tail.x, d.y - tail.y) > 4) d.trail.push({ x: d.x, y: d.y - d.r * 0.4 });
        if (d.trail.length > 60) d.trail.shift();

        // Swallow the beads it runs through (it grows, up to a point); they form again elsewhere
        for (const b of beads) {
          if (b.alpha < 1 || Math.abs(b.x - d.x) > d.r + b.r || Math.abs(b.y - d.y) > d.r + b.r) continue;
          d.r = Math.min(11, Math.hypot(d.r, b.r * 0.6));
          Object.assign(b, bead(0));
        }

        // Off the bottom: its trail dries off and a new drop forms at the top
        if (d.y - d.r * 3 > height) {
          trails.push({ points: d.trail, width: d.r * 0.55, life: 1 });
          Object.assign(d, drop(rand(-40, 0)));
        }
      }
      for (const b of beads) b.alpha = Math.min(1, b.alpha + 0.01 * dt);
      for (const t of trails) t.life -= 0.006 * dt;
      trails = trails.filter((t) => t.life > 0);

      draw();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);
    if (still) return () => resizeObserver.disconnect();

    // Only while the footer's on screen
    let running = false;
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting === running) return;
      running = entry.isIntersecting;
      if (running) gsap.ticker.add(tick);
      else gsap.ticker.remove(tick);
    });
    visibility.observe(host);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      resizeObserver.disconnect();
      visibility.disconnect();
      gsap.ticker.remove(tick);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className={className} />;
}
