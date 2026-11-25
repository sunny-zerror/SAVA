"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

interface Point {
  x: number;
  y: number;
}

/** A pre-shaded sprite, its size in CSS px and where the bead's middle sits in it */
interface Shape {
  sprite: HTMLCanvasElement;
  w: number;
  h: number;
  ax: number;
  ay: number;
}

/** A bead of sweat sitting on the surface */
interface Bead extends Point, Shape {
  r: number;
  /** Nudged off its spot by the pointer and pulled back by surface tension */
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  /** Fades in as a new bead forms */
  alpha: number;
}

/** A bead grown heavy enough to break away and run down */
interface Drop extends Point, Shape {
  r: number;
  speed: number;
  /** Its own hesitations, so drops don't stop and start together */
  seed: number;
  /** Distance run since it last left a speck behind */
  since: number;
  /** The size its sprite was drawn at, to redraw it once it's grown */
  drawnAt: number;
  trail: Point[];
}

interface Trail {
  points: Point[];
  width: number;
  life: number;
}

const REACH = 90; // px around the pointer that nudges beads
const MAX_DROPS = 7;
const TAU = Math.PI * 2;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const rgb = (hex: string, alpha: number) => {
  // Theme colours can come back shortened (#fff)
  let digits = hex.trim().replace("#", "");
  if (digits.length === 3) digits = [...digits].map((d) => d + d).join("");
  const n = parseInt(digits, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** Mostly specks, some small beads, a few heavy ones */
const beadSize = () => {
  const u = Math.random();
  if (u < 0.45) return rand(0.7, 1.6);
  if (u < 0.8) return rand(1.6, 3.2);
  if (u < 0.96) return rand(3.2, 5.5);
  return rand(5.5, 9);
};

/**
 * A bead's outline, round its middle. Bigger beads are often two or three that have run together:
 * the outline is the union of those circles seen from their shared centre, wobbled so no two match,
 * sagging a touch under their weight, then smoothed so the necks between them fill in as surface
 * tension pulls them. Small beads stay nearly round.
 */
function beadOutline(r: number): Point[] {
  const lobes = [{ x: 0, y: 0, r }];
  if (r > 2.2 && Math.random() < 0.65) {
    for (let i = Math.random() < 0.35 ? 2 : 1; i > 0; i--) {
      const a = rand(0, TAU);
      const d = r * rand(0.5, 0.9);
      lobes.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: r * rand(0.4, 0.75) });
    }
  }
  const area = lobes.reduce((sum, l) => sum + l.r * l.r, 0);
  const cx = lobes.reduce((sum, l) => sum + l.x * l.r * l.r, 0) / area;
  const cy = lobes.reduce((sum, l) => sum + l.y * l.r * l.r, 0) / area;

  const wobble = Math.min(0.14, 0.02 + r * 0.016);
  const [a2, a3, p2, p3] = [rand(0, wobble), rand(0, wobble * 0.7), rand(0, TAU), rand(0, TAU)];
  const n = 44;
  let radii = Array.from({ length: n }, (_, i) => {
    const t = (i / n) * TAU;
    const dx = Math.cos(t);
    const dy = Math.sin(t);
    // How far this ray from the centre gets before leaving the last circle it crosses
    let reach = 0;
    for (const l of lobes) {
      const wx = l.x - cx;
      const wy = l.y - cy;
      const along = wx * dx + wy * dy;
      const off = wx * wx + wy * wy - along * along;
      if (off < l.r * l.r) reach = Math.max(reach, along + Math.sqrt(l.r * l.r - off));
    }
    reach *= 1 + a2 * Math.cos(2 * t + p2) + a3 * Math.cos(3 * t + p3);
    return reach * (1 + 0.06 * Math.max(0, dy) - 0.03 * Math.max(0, -dy));
  });
  for (let pass = 0; pass < 3; pass++) {
    radii = radii.map((v, i) => (radii[(i + n - 1) % n] + 2 * v + radii[(i + 1) % n]) / 4);
  }
  return radii.map((v, i) => ({ x: Math.cos((i / n) * TAU) * v, y: Math.sin((i / n) * TAU) * v }));
}

/** A running drop: round and heavy at the bottom, drawn up into a point behind it */
function dropOutline(r: number): Point[] {
  return Array.from({ length: 44 }, (_, i) => {
    const t = (i / 44) * TAU;
    const up = Math.max(0, -Math.sin(t));
    return { x: Math.cos(t) * r * (1 - 0.55 * up ** 1.4), y: Math.sin(t) * r * (up > 0 ? 1.9 : 1) };
  });
}

/** A smooth closed curve through the outline's points */
function smoothPath(points: Point[]) {
  const path = new Path2D();
  const mid = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  const start = mid(points.at(-1)!, points[0]);
  path.moveTo(start.x, start.y);
  points.forEach((p, i) => {
    const next = mid(p, points[(i + 1) % points.length]);
    path.quadraticCurveTo(p.x, p.y, next.x, next.y);
  });
  path.closePath();
  return path;
}

/**
 * Shades an outline as clear water on skin, lit from the top left: a soft shadow cast down and right
 * (kept outside its edge), a body that's barely there, darker toward the light and brighter where the
 * light comes through at the bottom right, a fine dark edge on the lit side, and a sharp glint.
 */
function paint(points: Point[], r: number, dpr: number, paper: string, ink: string, strength: number): Shape {
  // Stronger shading reads on busier or brighter backgrounds
  const tone = (hex: string, alpha: number) => rgb(hex, Math.min(1, alpha * strength));
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const pad = 2 + r * 0.6;
  const w = maxX - minX + pad * 2;
  const h = maxY - minY + pad * 2;
  const sprite = document.createElement("canvas");
  sprite.width = Math.ceil(w * dpr);
  sprite.height = Math.ceil(h * dpr);
  const s = sprite.getContext("2d")!;
  s.scale(dpr, dpr);
  s.translate(pad - minX, pad - minY);
  const path = smoothPath(points);
  const across = (stops: [number, string][]) => {
    const g = s.createLinearGradient(minX, minY, maxX, maxY);
    for (const [at, colour] of stops) g.addColorStop(at, colour);
    return g;
  };

  s.save();
  s.translate(r * 0.08, r * 0.18);
  s.shadowColor = tone(ink, 0.3);
  s.shadowBlur = Math.max(1, r * 0.5) * dpr;
  s.fillStyle = tone(ink, 0.14);
  s.fill(path);
  s.restore();
  s.globalCompositeOperation = "destination-out";
  s.fill(path);
  s.globalCompositeOperation = "source-over";

  s.fillStyle = across([
    [0, tone(ink, 0.16)],
    [0.5, tone(paper, 0.03)],
    [1, tone(paper, 0.26)],
  ]);
  s.fill(path);

  // Light focused through the water, pooled inside its lower edge
  s.save();
  s.clip(path);
  s.strokeStyle = across([
    [0.35, tone(paper, 0)],
    [1, tone(paper, 0.6)],
  ]);
  s.lineWidth = Math.max(1, r * 0.4);
  s.stroke(path);
  s.restore();

  s.strokeStyle = across([
    [0, tone(ink, 0.45)],
    [0.6, tone(ink, 0.1)],
    [1, tone(ink, 0.03)],
  ]);
  s.lineWidth = Math.max(0.5, r * 0.07);
  s.stroke(path);

  s.fillStyle = tone(paper, 0.95);
  s.beginPath();
  s.ellipse(-r * 0.36, -r * 0.4, Math.max(0.45, r * 0.22), Math.max(0.3, r * 0.13), -0.7, 0, TAU);
  s.fill();
  if (r > 2.5) {
    s.fillStyle = tone(paper, 0.45);
    s.beginPath();
    s.arc(r * 0.3, r * 0.42, r * 0.08, 0, TAU);
    s.fill();
  }
  return { sprite, w, h, ax: pad - minX, ay: pad - minY };
}

/**
 * Sweat on the footer. Hundreds of beads of every size and shape sit on the blue in loose patches, each
 * shaded as clear water. The pointer nudges the beads near it a few pixels, and surface tension springs
 * them back with a little wobble. Every few seconds a heavy bead breaks away and runs slowly down —
 * hesitating now and then — swallowing the beads in its path, leaving specks and a wet streak behind,
 * while new beads slowly form. Built as the footer nears the screen and animated only while it's on it.
 * Reduced motion: still beads. Pass the layer's position in className.
 *
 * Kept cheap by drawing as little as possible each frame: beads at rest sit on a back canvas that's
 * only repainted a tile at a time where something changed; the front canvas carries just what's moving
 * (nudged and forming beads, drops, streaks) and is left alone while nothing is. Beads share a small
 * pool of shaded sprites, and a grid finds the ones near a point without looking at them all.
 */
interface FooterDropletsProps {
  className?: string;
  /** How many beads, against the usual (1) */
  density?: number;
  /** How strongly each is shaded, against the usual (1): higher stands out more on a busy background */
  strength?: number;
}

export default function FooterDroplets({ className, density: amount = 1, strength = 1 }: FooterDropletsProps) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const back = backRef.current;
    const front = frontRef.current;
    // The element the beads cover and take the pointer from: the nearest one marked for it, or the
    // layer's own parent
    const host = back?.closest<HTMLElement>("[data-droplets-host]") ?? back?.parentElement?.parentElement;
    const bctx = back?.getContext("2d");
    const fctx = front?.getContext("2d");
    if (!back || !front || !host || !bctx || !fctx) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const styles = getComputedStyle(document.documentElement);
    const paper = styles.getPropertyValue("--color-paper") || "#ffffff";
    const ink = styles.getPropertyValue("--color-ink") || "#33332e";

    let width = 0;
    let height = 0;
    let dpr = 1;
    let target = 0;
    let built: { w: number; h: number; dpr: number } | null = null;
    const beads = new Set<Bead>();
    /** Beads drawn on the front canvas: nudged off their spot, or still forming */
    const moving = new Set<Bead>();
    let drops: Drop[] = [];
    let trails: Trail[] = [];
    // Patchy, like sweat: beads gather more densely in some places than others
    const patch = [rand(0, TAU), rand(0, TAU)];
    const density = (x: number, y: number) =>
      0.3 + 0.7 * (0.5 + 0.5 * Math.sin(x * 0.011 + patch[0]) * Math.sin(y * 0.016 + patch[1]));

    // Shaded sprites, shared: sizes rounded to a step, a few shapes per size (redrawn if the DPR changes)
    let sprites = new Map<string, Shape>();
    const sprite = (key: string, r: number, outline: (r: number) => Point[]) => {
      let shape = sprites.get(key);
      if (!shape) {
        shape = paint(outline(r), r, dpr, paper, ink, strength);
        sprites.set(key, shape);
      }
      return shape;
    };
    const beadShape = (size: number) => {
      const small = size < 3.2;
      const step = small ? 0.25 : 0.5;
      const r = Math.max(0.5, Math.round(size / step) * step);
      const variant = Math.floor(Math.random() * (small ? 3 : 6));
      return { r, ...sprite(`b${r}:${variant}`, r, beadOutline) };
    };
    const dropShape = (r: number) => sprite(`d${Math.round(r * 2) / 2}`, Math.round(r * 2) / 2, dropOutline);

    // Spatial grid of the beads, so neighbours are found by looking only at the cells around a point
    const CELL = 24;
    let cols = 1;
    const grid = new Map<number, Bead[]>();
    const cellKey = (cx: number, cy: number) => cy * cols + cx;
    const cellX = (x: number) => Math.min(cols - 1, Math.max(0, Math.floor(x / CELL)));
    const cellY = (y: number) => Math.max(0, Math.floor(y / CELL));
    const near = (x0: number, y0: number, x1: number, y1: number, visit: (b: Bead) => void) => {
      for (let cy = cellY(y0); cy <= cellY(y1); cy++) {
        for (let cx = cellX(x0); cx <= cellX(x1); cx++) grid.get(cellKey(cx, cy))?.forEach(visit);
      }
    };

    // The back canvas, repainted a tile at a time
    const TILE = 128;
    const dirty = new Set<number>();
    let allDirty = false;
    const markDirty = (b: Bead) => {
      const x0 = Math.floor((b.x - b.ax) / TILE);
      const y0 = Math.floor((b.y - b.ay) / TILE);
      const x1 = Math.floor((b.x - b.ax + b.w) / TILE);
      const y1 = Math.floor((b.y - b.ay + b.h) / TILE);
      for (let ty = Math.max(0, y0); ty <= y1; ty++) {
        for (let tx = Math.max(0, x0); tx <= x1; tx++) dirty.add(ty * 10000 + tx);
      }
    };
    const drawResting = (b: Bead) => {
      if (!moving.has(b)) bctx.drawImage(b.sprite, b.x - b.ax, b.y - b.ay, b.w, b.h);
    };
    const flushBack = () => {
      if (allDirty) {
        allDirty = false;
        dirty.clear();
        bctx.clearRect(0, 0, width, height);
        beads.forEach(drawResting);
        return;
      }
      for (const key of dirty) {
        const x = (key % 10000) * TILE;
        const y = Math.floor(key / 10000) * TILE;
        bctx.save();
        bctx.beginPath();
        bctx.rect(x, y, TILE, TILE);
        bctx.clip();
        bctx.clearRect(x, y, TILE, TILE);
        // Sprites reach up to ~20px past their bead, so take in the beads just beyond the tile too
        near(x - CELL, y - CELL, x + TILE + CELL, y + TILE + CELL, drawResting);
        bctx.restore();
      }
      dirty.clear();
    };

    const addBead = (alpha: number, at?: Point, size = beadSize()) => {
      for (let tries = 0; tries < 8; tries++) {
        const x = at?.x ?? rand(0, width);
        const y = at?.y ?? rand(0, height);
        if (!at) {
          if (Math.random() > density(x, y)) continue;
          let fits = true;
          near(x - CELL, y - CELL, x + CELL, y + CELL, (b) => {
            if (fits && Math.hypot(b.x - x, b.y - y) <= (b.r + size) * 1.1) fits = false;
          });
          if (!fits) continue;
        }
        const bead: Bead = { x, y, ox: 0, oy: 0, vx: 0, vy: 0, alpha, ...beadShape(size) };
        beads.add(bead);
        const key = cellKey(cellX(x), cellY(y));
        const cell = grid.get(key);
        if (cell) cell.push(bead);
        else grid.set(key, [bead]);
        if (alpha < 1) moving.add(bead);
        else markDirty(bead);
        return;
      }
    };

    const removeBead = (b: Bead) => {
      if (!beads.delete(b)) return;
      const cell = grid.get(cellKey(cellX(b.x), cellY(b.y)));
      cell?.splice(cell.indexOf(b), 1);
      if (!moving.delete(b)) markDirty(b);
    };

    /** Off its spot: moves to the front canvas until it settles */
    const wake = (b: Bead) => {
      if (moving.has(b)) return;
      moving.add(b);
      markDirty(b);
    };

    const startDrop = (b: Bead) => {
      removeBead(b);
      const r = Math.max(b.r, 4);
      drops.push({ x: b.x, y: b.y, r, speed: 0, seed: rand(0, TAU), since: 0, drawnAt: r, trail: [], ...dropShape(r) });
    };

    const clearAll = () => {
      beads.clear();
      moving.clear();
      grid.clear();
      drops = [];
      trails = [];
    };

    // A batch of beads per frame rather than all at once, so building them never holds up a frame
    let filling = 0;
    const populate = () => {
      clearAll();
      target = Math.round(Math.min(1100, Math.max(200, (width * height) / 1000)) * amount);
      built = { w: width, h: height, dpr };
      cancelAnimationFrame(filling);
      let batches = 0;
      const batch = () => {
        for (let i = 0; i < 220 * amount && beads.size < target; i++) addBead(1);
        allDirty = true;
        flushBack();
        // A crowded footer may not fit them all; the rest fill in over time as beads come and go
        if (beads.size < target && ++batches < 20) filling = requestAnimationFrame(batch);
      };
      batch();
    };

    // The front canvas: streaks, moving beads and drops. Left untouched while there's nothing on it
    let frontEmpty = true;
    const drawFront = () => {
      const empty = !moving.size && !drops.length && !trails.length;
      if (empty && frontEmpty) return;
      fctx.clearRect(0, 0, width, height);
      frontEmpty = empty;
      if (empty) return;
      fctx.lineCap = "round";
      fctx.lineJoin = "round";
      // Wet streaks: drier (fainter) toward where they started
      const streak = (points: Point[], lineWidth: number, alpha: number) => {
        if (points.length < 2 || alpha <= 0) return;
        const a = points[0];
        const b = points.at(-1)!;
        const g = fctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, rgb(paper, 0));
        g.addColorStop(1, rgb(paper, alpha));
        fctx.strokeStyle = g;
        fctx.lineWidth = lineWidth;
        fctx.beginPath();
        fctx.moveTo(a.x, a.y);
        for (const p of points) fctx.lineTo(p.x, p.y);
        fctx.stroke();
      };
      fctx.globalAlpha = 1;
      for (const t of trails) streak(t.points, t.width, 0.1 * t.life);
      for (const d of drops) streak(d.trail, d.r * 0.7, 0.12);

      for (const b of moving) {
        // A touch of squash while it wobbles
        const sx = 1 + 0.1 * Math.min(1, Math.abs(b.vx)) - 0.05 * Math.min(1, Math.abs(b.vy));
        const sy = 1 + 0.1 * Math.min(1, Math.abs(b.vy)) - 0.05 * Math.min(1, Math.abs(b.vx));
        fctx.globalAlpha = b.alpha;
        fctx.drawImage(b.sprite, b.x + b.ox - b.ax * sx, b.y + b.oy - b.ay * sy, b.w * sx, b.h * sy);
      }
      fctx.globalAlpha = 1;
      for (const d of drops) fctx.drawImage(d.sprite, d.x - d.ax, d.y - d.ay, d.w, d.h);
    };

    const resize = () => {
      // 1.5 at most: the beads are small, and two footer-sized canvases at 2× cost far more to composite
      const nextDpr = Math.min(window.devicePixelRatio, 1.5);
      if (nextDpr !== dpr) sprites = new Map();
      dpr = nextDpr;
      width = host.clientWidth;
      height = host.clientHeight;
      cols = Math.max(1, Math.ceil(width / CELL));
      for (const [canvas, ctx] of [
        [back, bctx],
        [front, fctx],
      ] as const) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      frontEmpty = true;
      if (!built) return; // Not near the screen yet
      // Small changes keep the beads (any now outside are dropped and re-form); big ones start afresh
      const big =
        dpr !== built.dpr || Math.abs(width - built.w) > built.w * 0.15 || Math.abs(height - built.h) > built.h * 0.15;
      if (big) populate();
      else {
        // The grid's columns may have changed with the width: rebuild it from the beads that still fit
        const kept = [...beads].filter((b) => b.x < width && b.y < height);
        const live = [...moving];
        clearAll();
        for (const b of kept) {
          beads.add(b);
          const key = cellKey(cellX(b.x), cellY(b.y));
          const cell = grid.get(key);
          if (cell) cell.push(b);
          else grid.set(key, [b]);
        }
        for (const b of live) if (beads.has(b)) moving.add(b);
        allDirty = true;
        flushBack();
      }
      drawFront();
    };

    let nextDrip = 0;
    let sinceBead = 0;
    const tick = (time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs / 16.67, 3);

      // Every few seconds a heavy bead breaks away on its own
      if (time > nextDrip) {
        nextDrip = time + rand(2, 4.5) / amount;
        if (drops.length < MAX_DROPS * amount) {
          const heavy = [...beads].filter((b) => b.r > 3.6 && b.y < height - 60);
          if (heavy.length) startDrop(heavy[Math.floor(Math.random() * heavy.length)]);
        }
      }
      // New beads keep forming to replace the ones taken
      sinceBead += deltaMs;
      if (beads.size < target && sinceBead > 120) {
        sinceBead = 0;
        addBead(0);
      }

      for (const b of moving) {
        b.alpha = Math.min(1, b.alpha + 0.008 * dt);
        if (b.ox || b.oy || b.vx || b.vy) {
          // Surface tension springs it back to its spot, a little underdamped so it wobbles
          b.vx += (-b.ox * 0.06 - b.vx * 0.16) * dt;
          b.vy += (-b.oy * 0.06 - b.vy * 0.16) * dt;
          b.ox += b.vx * dt;
          b.oy += b.vy * dt;
          const max = Math.min(4, 1.5 + b.r * 0.35);
          const off = Math.hypot(b.ox, b.oy);
          if (off > max) {
            b.ox *= max / off;
            b.oy *= max / off;
          }
          if (Math.abs(b.ox) + Math.abs(b.oy) + Math.abs(b.vx) + Math.abs(b.vy) < 0.01) b.ox = b.oy = b.vx = b.vy = 0;
        }
        // Settled and fully formed: back to the resting canvas
        if (b.alpha >= 1 && !b.ox && !b.oy && !b.vx && !b.vy) {
          moving.delete(b);
          markDirty(b);
        }
      }

      const specks: Point[] = [];
      for (const d of drops) {
        // Slow, heavier drops a little faster, hesitating now and then before running on
        const pace = (0.18 + d.r * 0.07) * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(time * 1.1 + d.seed)));
        d.speed += (pace - d.speed) * 0.05 * dt;
        const dy = d.speed * dt;
        d.y += dy;
        // The faintest wander as it finds its way down
        d.x += Math.sin(d.y * 0.045 + d.seed) * 0.05 * dt;
        d.since += dy;

        const tail = d.trail.at(-1);
        if (!tail || d.y - tail.y > 3) d.trail.push({ x: d.x, y: d.y - d.r * 0.3 });
        if (d.trail.length > 110) d.trail.shift();

        // Swallow the beads in its path
        const swallowed: Bead[] = [];
        near(d.x - d.r - 9, d.y - d.r, d.x + d.r + 9, d.y + d.r + 9, (b) => {
          if (b.alpha < 0.6 || Math.abs(b.x - d.x) > d.r * 0.9 + b.r) return;
          if (b.y < d.y - d.r || b.y > d.y + d.r + b.r) return;
          swallowed.push(b);
        });
        for (const b of swallowed) {
          d.r = Math.min(9, Math.hypot(d.r, b.r * 0.8));
          removeBead(b);
        }
        // Leave a speck behind now and then, losing a little water to it
        if (d.since > rand(20, 40)) {
          d.since = 0;
          if (Math.random() < 0.55) {
            specks.push({ x: d.x + rand(-0.8, 0.8), y: d.y - d.r * 2.2 });
            d.r = Math.max(3.5, d.r - 0.05);
          }
        }
        if (Math.abs(d.r - d.drawnAt) > 0.5) Object.assign(d, dropShape(d.r), { drawnAt: d.r });
      }
      for (const p of specks) addBead(1, p, rand(0.6, 1.4));

      // Off the bottom: its streak dries off
      for (const d of drops.filter((d) => d.y - d.r * 2 > height)) {
        trails.push({ points: d.trail, width: d.r * 0.7, life: 1 });
        drops.splice(drops.indexOf(d), 1);
      }
      for (const t of trails) t.life -= 0.005 * dt;
      trails = trails.filter((t) => t.life > 0);

      if (dirty.size || allDirty) flushBack();
      drawFront();
    };

    // The pointer nudges nearby beads along its way; heavy beads it brushes may break away
    const last = { x: 0, y: 0, set: false };
    const onMove = (e: PointerEvent) => {
      const rect = back.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const mx = last.set ? gsap.utils.clamp(-24, 24, x - last.x) : 0;
      const my = last.set ? gsap.utils.clamp(-24, 24, y - last.y) : 0;
      Object.assign(last, { x, y, set: true });
      if (!mx && !my) return;
      const breaking: Bead[] = [];
      near(x - REACH, y - REACH, x + REACH, y + REACH, (b) => {
        const dx = b.x - x;
        const dy = b.y - y;
        const sq = dx * dx + dy * dy;
        if (sq > REACH * REACH) return;
        const f = (1 - Math.sqrt(sq) / REACH) ** 2;
        const give = 0.012 + b.r * 0.006;
        b.vx += mx * f * give;
        b.vy += my * f * give;
        wake(b);
        if (b.r > 4 && f > 0.4 && Math.random() < 0.03 * f) breaking.push(b);
      });
      for (const b of breaking) if (drops.length < MAX_DROPS * amount) startDrop(b);
    };
    const onLeave = () => {
      last.set = false;
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    // Built as the footer nears the screen; animated only while it's on it
    let running = false;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !built) populate();
        if (still || entry.isIntersecting === running) return;
        running = entry.isIntersecting;
        if (running) gsap.ticker.add(tick);
        else gsap.ticker.remove(tick);
      },
      { rootMargin: "300px 0px" },
    );
    visibility.observe(host);
    if (!still) {
      host.addEventListener("pointermove", onMove);
      host.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(filling);
      resizeObserver.disconnect();
      visibility.disconnect();
      gsap.ticker.remove(tick);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [amount, strength]);

  return (
    <div aria-hidden="true" className={className}>
      <canvas ref={backRef} className="absolute inset-0 size-full" />
      <canvas ref={frontRef} className="absolute inset-0 size-full" />
    </div>
  );
}
