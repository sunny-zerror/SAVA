/*
 * The shopping assistant's visuals: the moving gradient inside the launcher and the orb, and the
 * size of the opening ripple. One painter draws both: four soft
 * blobs drifting on layered sines and two sine waves, blended additively — softly in the orb, brightly
 * in the launcher. Its colours come from the design tokens in globals.css (SAVA blue, navy, mist,
 * paper), so re-skinning the site re-skins it too.
 */

type Rgb = readonly [number, number, number];

/** What the moving gradient is painted in */
export interface GradientColors {
  blobs: readonly Rgb[];
  waves: readonly Rgb[];
}

export interface AssistantPalette extends GradientColors {
  /** The orb's body, from its lit side to its deep side, and the halo round it */
  orbLight: Rgb;
  orbDeep: Rgb;
  halo: Rgb;
}

const TAU = Math.PI * 2;

const mix = (from: Rgb, to: Rgb, amount: number): Rgb => [
  Math.round(from[0] + (to[0] - from[0]) * amount),
  Math.round(from[1] + (to[1] - from[1]) * amount),
  Math.round(from[2] + (to[2] - from[2]) * amount),
];

/**
 * A colour as RGB. A canvas parses whatever CSS colour it's given (a token may be hex, rgb() or
 * oklch()) and hands it back as hex or rgba(); without one, `color` has to be hex already.
 */
function toRgb(color: string, ctx: CanvasRenderingContext2D | null): Rgb {
  let value = color;
  if (ctx) {
    ctx.fillStyle = "#000";
    ctx.fillStyle = color;
    value = String(ctx.fillStyle);
  }
  if (value.startsWith("#")) {
    const n = Number.parseInt(value.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const [r = 0, g = 0, b = 0] = value.match(/[\d.]+/g)?.map(Number) ?? [];
  return [r, g, b];
}

let tokens: { accent: Rgb; navy: Rgb; mist: Rgb } | null = null;

/** The brand colours the painter mixes from, read once from the tokens (globals.css) */
function readTokens() {
  if (tokens) return tokens;
  const ctx = document.createElement("canvas").getContext("2d");
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string, fallback: string) =>
    ctx ? toRgb(styles.getPropertyValue(name).trim() || fallback, ctx) : toRgb(fallback, null);
  tokens = {
    accent: token("--color-accent", "#709fcb"),
    navy: token("--color-navy", "#021b5b"),
    mist: token("--color-mist", "#d8e3ff"),
  };
  return tokens;
}

let palette: AssistantPalette | null = null;

/** The painter's colours for the assistant's stage and orb */
export function readAssistantPalette(): AssistantPalette {
  if (palette) return palette;
  const { accent, navy, mist } = readTokens();
  // Navy for depth, SAVA blue, and mist for the light that gathers where the blobs cross
  palette = {
    blobs: [mix(accent, navy, 0.35), accent, mist, navy],
    waves: [mix(accent, mist, 0.4), mix(accent, navy, 0.3)],
    orbLight: accent,
    orbDeep: mix(accent, navy, 0.7),
    halo: accent,
  };
  return palette;
}

let launcher: GradientColors | null = null;

/**
 * The launcher's colours: lighter than the stage's, painted bright (paintAssistantGradient's `bright`)
 * over the button's navy, so the button glows like a bubble — a white-hot core where the light
 * crosses, mid and sky blues towards its rim
 */
export function readLauncherColors(): GradientColors {
  if (launcher) return launcher;
  const { accent, navy, mist } = readTokens();
  launcher = {
    blobs: [mix(accent, navy, 0.15), mist, accent, mix(accent, mist, 0.45)],
    waves: [mix(accent, mist, 0.2), mix(accent, mist, 0.4)],
  };
  return launcher;
}

// ---------- Drift ------------------------------------------------------------

/** Each blob: home position and drift, as fractions of the canvas, and its pace */
const BLOBS = [
  { x: 0.35, y: 0.6, r: 0.85, ampX: 0.28, ampY: 0.22, ampR: 0.04, speed: 0.9, phase: 0 },
  { x: 0.65, y: 0.3, r: 0.72, ampX: 0.3, ampY: 0.26, ampR: 0.04, speed: 0.63, phase: 2.1 },
  { x: 0.7, y: 0.65, r: 0.72, ampX: 0.26, ampY: 0.28, ampR: 0.04, speed: 1.17, phase: 4.3 },
  { x: 0.3, y: 0.35, r: 0.63, ampX: 0.32, ampY: 0.24, ampR: 0.03, speed: 0.51, phase: 1.2 },
];

/** Each wave: one fills downwards (direction 1), the other upwards */
const WAVES = [
  { amplitude: 0.22, frequency: 0.6, speed: 0.7, phase: 1.4, opacity: 0.47, direction: 1 },
  { amplitude: 0.22, frequency: 0.6, speed: 0.45, phase: 1.4 + Math.PI, opacity: 0.41, direction: -1 },
];

/** A blob's centre and radius at `time` (seconds), as fractions of the canvas */
function blobFrame(blob: (typeof BLOBS)[number], time: number) {
  const t = time * blob.speed;
  const dx = Math.sin(t + blob.phase) * 0.7 + Math.sin(t * 1.73 + blob.phase * 2.1) * 0.3;
  const dy = Math.cos(t * 0.8 + blob.phase + 1.3) * 0.7 + Math.cos(t * 2.11 + blob.phase * 1.7 + 0.4) * 0.3;
  const dr = Math.sin(t * 0.6 + blob.phase + 2.5) * 0.6 + Math.sin(t * 1.47 + blob.phase * 0.9 + 3.1) * 0.4;
  return { x: blob.x + dx * blob.ampX, y: blob.y + dy * blob.ampY, r: blob.r + dr * blob.ampR };
}

/** A wave's height (px) at `x` (0–1 across) and `time` (seconds) */
function waveY(wave: (typeof WAVES)[number], x: number, time: number, height: number) {
  const t = time * wave.speed;
  const swell = 1 + Math.sin(t * 0.5 + wave.phase) * 0.15;
  const drift = Math.sin(t * 0.4 + wave.phase + 2) * height * 0.06;
  return (
    height * 0.5 + drift + Math.sin(x * TAU * wave.frequency + t * 1.2 + wave.phase) * height * wave.amplitude * swell
  );
}

// ---------- Painting ---------------------------------------------------------

const rgba = ([r, g, b]: Rgb, alpha: number) => `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`;

/**
 * How strongly it's painted: a blob's alpha at its centre, 35% and 70% of its radius, and a scale on
 * the waves' opacity. Soft for the stage and orb, so where blobs cross the light builds to mist; bright
 * for the launcher, where it burns to white.
 */
const STRENGTH = {
  soft: { blob: [0.39, 0.23, 0.07], wave: 1 },
  bright: { blob: [0.77, 0.47, 0.13], wave: 1.8 },
};

/**
 * The gradient over a `width` × `height` area at `time` (seconds). `intensity` (0–1) dims it;
 * `clear: false` paints over what's already there (the orb's body); `bright` paints it at the
 * launcher's strength (STRENGTH).
 */
export function paintAssistantGradient(
  ctx: CanvasRenderingContext2D,
  colors: GradientColors,
  width: number,
  height: number,
  time: number,
  { intensity = 1, clear = true, bright = false } = {},
) {
  if (clear) ctx.clearRect(0, 0, width, height);
  const strength = bright ? STRENGTH.bright : STRENGTH.soft;
  const previous = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";

  BLOBS.forEach((blob, i) => {
    const color = colors.blobs[i % colors.blobs.length];
    const { x, y, r } = blobFrame(blob, time);
    const cx = x * width;
    const cy = y * height;
    const radius = Math.max(1, r * Math.max(width, height));
    const fill = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    fill.addColorStop(0, rgba(color, strength.blob[0] * intensity));
    fill.addColorStop(0.35, rgba(color, strength.blob[1] * intensity));
    fill.addColorStop(0.7, rgba(color, strength.blob[2] * intensity));
    fill.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, width, height);
  });

  WAVES.forEach((wave, i) => {
    const color = colors.waves[i % colors.waves.length];
    const steps = 64;
    ctx.beginPath();
    ctx.moveTo(0, waveY(wave, 0, time, height));
    for (let step = 1; step <= steps; step++)
      ctx.lineTo((step / steps) * width, waveY(wave, step / steps, time, height));
    const edge = wave.direction === 1 ? height + 20 : -20;
    ctx.lineTo(width, edge);
    ctx.lineTo(0, edge);
    ctx.closePath();
    // Strongest along the crest, fading into the fill
    const samples = Array.from({ length: 8 }, (_, s) => waveY(wave, s / 7, time, height));
    const start = wave.direction === 1 ? Math.min(...samples) : Math.max(...samples);
    const end = start + wave.direction * height * 0.6;
    const fill = ctx.createLinearGradient(0, start, 0, end);
    const alpha = wave.opacity * strength.wave * intensity;
    fill.addColorStop(0, rgba(color, alpha));
    fill.addColorStop(0.4, rgba(color, alpha * 0.55));
    fill.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = fill;
    ctx.fill();
  });

  ctx.globalCompositeOperation = previous;
}

/**
 * The orb, centred in a `size` × `size` canvas: a halo, a lit sphere with the gradient moving inside
 * it, and a shine. `level` (0–1) swells it (the microphone, a reply); `intensity` dims it (asleep).
 */
export function paintAssistantOrb(
  ctx: CanvasRenderingContext2D,
  colors: AssistantPalette,
  size: number,
  time: number,
  { level = 0, intensity = 1 } = {},
) {
  const center = size / 2;
  const breath = Math.sin(time * 1.2) * 0.015;
  const radius = center * 0.72 * (1 + breath + 0.16 * Math.max(0, Math.min(1, level)));
  ctx.clearRect(0, 0, size, size);

  const halo = ctx.createRadialGradient(center, center, radius * 0.8, center, center, radius * 1.34);
  halo.addColorStop(0, rgba(colors.halo, 0.32 * intensity));
  halo.addColorStop(1, rgba(colors.halo, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(center, center, radius * 1.34, 0, TAU);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TAU);
  ctx.clip();
  ctx.globalAlpha = 0.55 + 0.45 * intensity;
  const body = ctx.createRadialGradient(
    center - radius * 0.2,
    center - radius * 0.25,
    radius * 0.1,
    center,
    center,
    radius,
  );
  body.addColorStop(0, rgba(colors.orbLight, 1));
  body.addColorStop(1, rgba(colors.orbDeep, 1));
  ctx.fillStyle = body;
  ctx.fillRect(center - radius, center - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
  ctx.translate(center - radius, center - radius);
  // Lower than in the launcher: at this size the light needs less to fill the sphere
  paintAssistantGradient(ctx, colors, radius * 2, radius * 2, time, { intensity: intensity * 0.7, clear: false });
  ctx.restore();

  const shineX = center - radius * 0.35;
  const shineY = center - radius * 0.4;
  const shine = ctx.createRadialGradient(shineX, shineY, 0, shineX, shineY, radius * 0.7);
  shine.addColorStop(0, `rgba(255, 255, 255, ${0.24 * intensity})`);
  shine.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = shine;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, TAU);
  ctx.fill();
}

// ---------- Motion maths -----------------------------------------------------

/** The soft edge (px) of the stage's reveal, inside its radius */
const RIPPLE_EDGE_PX = 60;

/** The ripple radius (px) that covers the whole screen from (x, y) */
export const rippleRadius = (x: number, y: number, width: number, height: number) =>
  Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) * 1.1 + RIPPLE_EDGE_PX;
