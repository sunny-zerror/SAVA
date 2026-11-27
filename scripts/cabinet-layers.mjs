/*
 * Builds the /home1 cabinet scene's two layers from their sources (run: node scripts/cabinet-layers.mjs):
 *
 *   newhome/cabinet/wall.jpg      the wall, from newhome/hero_only_bg.png (the original photo's wall in
 *                                 SAVA blue, cabinet removed) set into the scene box and carried on past
 *                                 it: whole boards repeated sideways, the wall mirrored upwards
 *   newhome/cabinet/cabinet.webp  the cabinet, keyed out of newhome/cabinet/scene.jpg (the original photo,
 *                                 extended, with what the page animates painted out) by its teal wall:
 *                                 transparent where the wall was, edges un-mixed from it so no teal fringe,
 *                                 and a soft navy shadow cast on the wall, down and to the right
 *   newhome/cabinet/towel.webp,   the towel and the plant's leaves the page animates, from towel.png and
 *   newhome/cabinet/plant.webp    plant.png (cut out of the same photo): the teal they carried at their
 *                                 edges, and their shadows on it, keyed away the same way
 *
 * The scene layers share scene.jpg's box (3072 × 1841, the photo at 800, 900), the pixels
 * src/components/sections/home1/cabinet-scene.ts lays everything out in. The new wall lines up with the
 * photo board for board.
 */
import sharp from "sharp";

const DIR = "public/images/newhome";
const BOX = { width: 3072, height: 1841, x: 800, y: 900 };

// ---------- The wall --------------------------------------------------------------------------------

/** Two of the wall's grooves, a whole number of boards apart: the span between them repeats seamlessly */
const GROOVES = [83, 1604];

async function buildWall() {
  const { data: src, info } = await sharp(`${DIR}/hero_only_bg.png`)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: sw, height: sh } = info;
  const period = GROOVES[1] - GROOVES[0];
  const out = Buffer.alloc(BOX.width * BOX.height * 3);
  for (let y = 0; y < BOX.height; y++) {
    // Above the photo, the wall mirrored upwards (it's even from top to bottom, so the join doesn't show)
    let sy = y - BOX.y;
    if (sy < 0) sy = Math.min(sh - 1, -sy - 1);
    sy = Math.min(sh - 1, sy);
    for (let x = 0; x < BOX.width; x++) {
      // Beside it, the boards carried on: whole boards, repeated
      let sx = x - BOX.x;
      if (sx < 0 || sx >= sw) sx = ((((sx - GROOVES[0]) % period) + period) % period) + GROOVES[0];
      const i = (y * BOX.width + x) * 3;
      const j = (sy * sw + sx) * 3;
      out[i] = src[j];
      out[i + 1] = src[j + 1];
      out[i + 2] = src[j + 2];
    }
  }
  await sharp(out, { raw: { width: BOX.width, height: BOX.height, channels: 3 } })
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`${DIR}/cabinet/wall.jpg`);
}

// ---------- The cabinet -----------------------------------------------------------------------------

/** The shadow the cabinet casts on the wall: offset and blur radius in the photo's pixels, strength, navy */
const SHADOW = { dx: 10, dy: 14, radius: 18, opacity: 0.38, color: [2, 27, 91] };

/** The photo's wall: its hue (degrees) and saturation; the cabinet's own colours stay under 0.1 saturation */
const TEAL = { hue: 197, saturation: 0.53 };
const smoothstep = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** How much of a pixel is the teal wall, 0–1: by hue, then by how saturated it is */
function wallness(r, g, b) {
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  if (!max || !d) return 0;
  let h;
  if (max === r) h = 60 * (((g - b) / d) % 6);
  else if (max === g) h = 60 * ((b - r) / d + 2);
  else h = 60 * ((r - g) / d + 4);
  if (h < 0) h += 360;
  const off = Math.abs(((h - TEAL.hue + 540) % 360) - 180);
  const byHue = 1 - smoothstep(16, 30, off);
  return byHue * smoothstep(0.12, 0.42, d / max);
}

/** Box blur, in place, of a single-channel float image, `passes` times (≈ a gaussian) */
function blur(values, width, height, radius, passes = 2) {
  const tmp = new Float32Array(values.length);
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < height; y++) {
      let sum = 0;
      const row = y * width;
      for (let x = -radius; x <= radius; x++) sum += values[row + Math.min(width - 1, Math.max(0, x))];
      for (let x = 0; x < width; x++) {
        tmp[row + x] = sum / (2 * radius + 1);
        sum += values[row + Math.min(width - 1, x + radius + 1)] - values[row + Math.max(0, x - radius)];
      }
    }
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let y = -radius; y <= radius; y++) sum += tmp[Math.min(height - 1, Math.max(0, y)) * width + x];
      for (let y = 0; y < height; y++) {
        values[y * width + x] = sum / (2 * radius + 1);
        sum += tmp[Math.min(height - 1, y + radius + 1) * width + x] - tmp[Math.max(0, y - radius) * width + x];
      }
    }
  }
}

async function buildCabinet() {
  const { data: src, info } = await sharp(`${DIR}/cabinet/scene.jpg`)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const n = width * height;

  // Each pixel's share of the wall
  const wall = new Float32Array(n);
  for (let k = 0; k < n; k++) wall[k] = wallness(src[k * 3], src[k * 3 + 1], src[k * 3 + 2]);

  // The wall's own colour everywhere, spread in from the pure wall nearby: what an edge pixel was mixed with
  const pure = new Float32Array(n);
  const plate = [0, 1, 2].map(() => new Float32Array(n));
  for (let k = 0; k < n; k++) {
    const m = wall[k] > 0.97 ? 1 : 0;
    pure[k] = m;
    for (let c = 0; c < 3; c++) plate[c][k] = src[k * 3 + c] * m;
  }
  blur(pure, width, height, 24);
  for (const channel of plate) blur(channel, width, height, 24);

  // Its shadow: its own shape, shifted and softened
  const shadow = new Float32Array(n);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const sx = x - SHADOW.dx;
      const sy = y - SHADOW.dy;
      if (sx >= 0 && sy >= 0) shadow[y * width + x] = 1 - wall[sy * width + sx];
    }
  blur(shadow, width, height, SHADOW.radius, 3);

  const out = Buffer.alloc(n * 4);
  for (let k = 0; k < n; k++) {
    const alpha = 1 - wall[k];
    const i = k * 4;
    // The cabinet over its shadow
    const shade = shadow[k] * SHADOW.opacity * (1 - alpha);
    const total = alpha + shade;
    out[i + 3] = Math.round(total * 255);
    if (total <= 0.004) continue;
    if (alpha <= 0.02) {
      for (let c = 0; c < 3; c++) out[i + c] = SHADOW.color[c];
      continue;
    }
    for (let c = 0; c < 3; c++) {
      const p = src[k * 3 + c];
      let colour = p;
      if (alpha < 0.98 && pure[k] >= 0.02) {
        // Un-mix the edge from the wall behind it: p = alpha·colour + (1 − alpha)·wall
        const behind = plate[c][k] / pure[k];
        colour = Math.min(255, Math.max(0, (p - (1 - alpha) * behind) / alpha));
      }
      out[i + c] = Math.round((colour * alpha + SHADOW.color[c] * shade) / total);
    }
  }
  await sharp(out, { raw: { width, height, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(`${DIR}/cabinet/cabinet.webp`);
}

// ---------- The cutouts -----------------------------------------------------------------------------

/** The wall's teal, for un-mixing the cutouts' edges (they carry no wall around them to sample) */
const TEAL_RGB = [85, 156, 186];

async function cleanCutout(name) {
  const { data, info } = await sharp(`${DIR}/cabinet/${name}.png`)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const w = wallness(data[i], data[i + 1], data[i + 2]);
    if (w <= 0) continue;
    const keep = 1 - w;
    out[i + 3] = Math.round(data[i + 3] * keep);
    if (keep <= 0.02) continue;
    for (let c = 0; c < 3; c++)
      out[i + c] = Math.round(Math.min(255, Math.max(0, (data[i + c] - w * TEAL_RGB[c]) / keep)));
  }
  await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(`${DIR}/cabinet/${name}.webp`);
}

await Promise.all([buildWall(), buildCabinet(), cleanCutout("towel"), cleanCutout("plant")]);
console.log("Built newhome/cabinet/wall.jpg, cabinet.webp, towel.webp and plant.webp");
