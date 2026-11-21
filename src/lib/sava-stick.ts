import type * as Three from "three";

type THREE = typeof Three;

/*
 * The SAVA stick, built in code from the product photo (public/images/products/sava-balanced.jpg).
 * Profiles are the photo's measured half-widths in photo pixels (1 unit = 1000 px), used as the radius of a
 * oval cross-section (see DEPTH). The label is the photo's own printing, lifted onto a transparent
 * texture (public/models/sava-balanced-label.png) and wrapped around the front like a printed sleeve.
 */

/*
 * The three SAVA sticks share one mould; each has its own finish and printed label. Labels are lifted
 * from public/images/products/sava-<variant>.jpg onto one shared layout, so any label fits any stick.
 */
export const STICK_VARIANTS = {
  balanced: { body: 0x6f96c0, knob: 0x6d95bf, recess: 0x3f5f84, roughness: 0.58, metalness: 0 },
  // Brushed silver
  kinetic: { body: 0xc3c6ca, knob: 0xa9adb2, recess: 0x55595f, roughness: 0.45, metalness: 0.6 },
  // Deep forest green
  renewed: { body: 0x12292a, knob: 0x163130, recess: 0x08130f, roughness: 0.6, metalness: 0 },
};

export type SavaStickVariant = keyof typeof STICK_VARIANTS;

export const stickLabelUrl = (variant: SavaStickVariant) => `/models/sava-${variant}-label.png`;

/** The stick for a catalogue product, matched by slug ("sava-kinetic" → kinetic); null if it has none */
export function stickVariantFor(slug: string): SavaStickVariant | null {
  const name = slug.replace(/^sava-/, "");
  return name in STICK_VARIANTS ? (name as SavaStickVariant) : null;
}

const CENTER_X = 559.5; // photo x of the stick's axis
const BOTTOM_Y = 1240; // photo y of the base
const DEPTH = 0.65; // half-depth ÷ half-width: 1 = round, < 1 = oval (flatter front to back)
const ROUNDNESS = 2; // superellipse exponent: 2 = circle/ellipse, higher = boxier
const LABEL_RADIUS = 265; // photo px: the label's flat width wraps around a cylinder this size
const RING = 192; // segments around

// [photo y, half-width] down the body: shoulder → waist → flared foot
const BODY: [number, number][] = [
  [388, 270],
  [389.5, 276],
  [393, 278.5],
  [421, 281.5],
  [461, 283.5],
  [501, 284],
  [541, 283.5],
  [581, 279.5],
  [621, 274.5],
  [661, 268],
  [701, 263],
  [741, 258.5],
  [781, 255.5],
  [831, 252],
  [901, 250],
  [961, 249.5],
  [1021, 250.5],
  [1071, 252.5],
  [1111, 255.5],
  [1151, 260],
  [1191, 265.5],
  [1214, 266],
  [1226, 263.5],
  [1234, 258],
  [1238.5, 250],
  [1240, 240],
];

// [photo y, half-width] down the cap: domed top → straight-ish walls
const CAP: [number, number][] = [
  [146, 0],
  [148, 95],
  [153, 150],
  [161, 186],
  [171, 206],
  [181, 218.5],
  [191, 227.5],
  [211, 237.5],
  [241, 245],
  [281, 252.5],
  [321, 259],
  [361, 264.5],
  [384, 265.5],
  [387, 262],
];

// The open notch at the foot, front and back, that shows the twist knob
const NOTCH_TOP = 1128;
const NOTCH_HALF = 127.5;
const KNOB = { radius: 120, top: 1136, bottom: 1236, ribs: 32, ribDepth: 3.5 };
// Printed area, in photo px — must match the crop used to make the label texture
const LABEL = { left: 350, top: 450, width: 410, height: 630 };

const toY = (py: number) => (BOTTOM_Y - py) / 1000;

/** Smooth (Catmull-Rom) half-width at photo y from a knot list */
function profile(knots: [number, number][], py: number) {
  const next = knots.findIndex(([y]) => y > py);
  const i = Math.max(0, next === -1 ? knots.length - 2 : next - 1);
  const p0 = knots[Math.max(0, i - 1)];
  const p1 = knots[i];
  const p2 = knots[i + 1];
  const p3 = knots[Math.min(knots.length - 1, i + 2)];
  const t = Math.min(1, Math.max(0, (py - p1[0]) / (p2[0] - p1[0])));
  const m1 = ((p2[1] - p0[1]) / (p2[0] - p0[0] || 1)) * (p2[0] - p1[0]);
  const m2 = ((p3[1] - p1[1]) / (p3[0] - p1[0] || 1)) * (p2[0] - p1[0]);
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
}

/** Rows to loft through: dense along the curve, plus every knot exactly */
function rows(knots: [number, number][], step: number, extra: number[] = []) {
  const ys = new Set<number>([...knots.map(([y]) => y), ...extra]);
  for (let y = knots[0][0]; y < knots.at(-1)![0]; y += step) ys.add(y);
  return [...ys].sort((a, b) => a - b).map((py) => ({ py, hw: profile(knots, py) }));
}

const pow = (v: number, e: number) => Math.sign(v) * Math.abs(v) ** e;

/** Point on the oval at angle θ (θ = π/2 faces the camera, +z) */
function ovalPoint(hw: number, theta: number) {
  return { x: hw * pow(Math.cos(theta), 2 / ROUNDNESS), z: hw * DEPTH * pow(Math.sin(theta), 2 / ROUNDNESS) };
}

/** Angle where the oval's x reaches ±fraction of its half-width — fixed for any width */
const edgeAngle = (fraction: number) => Math.acos(fraction ** (ROUNDNESS / 2));

/**
 * Lofts rings of the oval through the rows. `skip(row, angle)` drops faces (for the notch);
 * rows are top → bottom in photo space.
 */
function loft(
  THREE: THREE,
  ringRows: { py: number; hw: number }[],
  angles: number[],
  skip?: (py: number, a: number) => boolean,
) {
  const positions: number[] = [];
  const indices: number[] = [];
  const n = angles.length;
  for (const { py, hw } of ringRows) {
    for (const a of angles) {
      const p = ovalPoint(hw / 1000, a);
      positions.push(p.x, toY(py), p.z);
    }
  }
  for (let r = 0; r < ringRows.length - 1; r++) {
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const mid = angles[i] + ((angles[j] - angles[i] + Math.PI * 2) % (Math.PI * 2)) / 2;
      if (skip?.((ringRows[r].py + ringRows[r + 1].py) / 2, mid)) continue;
      const a = r * n + i;
      const b = r * n + j;
      const c = (r + 1) * n + i;
      const d = (r + 1) * n + j;
      // Counter-clockwise seen from outside
      indices.push(a, b, c, b, d, c);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createSavaStick(THREE: THREE, variant: SavaStickVariant, label?: Three.Texture) {
  const finish = STICK_VARIANTS[variant];
  const plastic = new THREE.MeshPhysicalMaterial({
    color: finish.body,
    roughness: finish.roughness,
    metalness: finish.metalness,
    clearcoat: 0.25,
    clearcoatRoughness: 0.55,
  });
  const shadowed = new THREE.MeshStandardMaterial({ color: finish.recess, roughness: 0.9, side: THREE.DoubleSide });
  const knobMaterial = new THREE.MeshPhysicalMaterial({
    color: finish.knob,
    roughness: Math.min(finish.roughness, 0.5),
    metalness: finish.metalness,
    clearcoat: 0.2,
  });

  // Ring angles, with the notch edges as exact columns so the cut is clean
  const notchFraction = NOTCH_HALF / profile(BODY, NOTCH_TOP);
  const ea = edgeAngle(notchFraction);
  const angleSet = new Set<number>([ea, Math.PI - ea, Math.PI + ea, Math.PI * 2 - ea]);
  for (let i = 0; i < RING; i++) angleSet.add((i / RING) * Math.PI * 2);
  const angles = [...angleSet].sort((a, b) => a - b);
  const inNotch = (a: number) => (a > ea && a < Math.PI - ea) || (a > Math.PI + ea && a < Math.PI * 2 - ea);

  const group = new THREE.Group();
  group.name = `SAVA ${variant}`;

  // Body: closed top (the ledge the cap sits on) and bottom, notch cut front and back
  const bodyRows = rows(BODY, 4, [NOTCH_TOP]);
  const bodyRings = [{ py: BODY[0][0], hw: 0 }, ...bodyRows, { py: BOTTOM_Y, hw: 0 }];
  const body = loft(THREE, bodyRings, angles, (py, a) => py > NOTCH_TOP && py < BOTTOM_Y - 3 && inNotch(a));
  group.add(new THREE.Mesh(body, plastic));

  // Cap
  const capRows = rows(CAP, 3);
  group.add(new THREE.Mesh(loft(THREE, [...capRows, { py: CAP.at(-1)![0], hw: 0 }], angles), plastic));

  // Notch recess, in shade: side walls and ceiling where the shell was cut, plus a back wall (z = 0)
  // and floor so it reads as a pocket around the knob rather than a hole through the stick
  type V = [number, number, number];
  const channel: number[] = [];
  const quad = (a: V, b: V, c: V, d: V) => channel.push(...a, ...b, ...c, ...a, ...c, ...d);
  const wallRows = rows(BODY, 4).filter(({ py }) => py >= NOTCH_TOP);
  for (let r = 0; r < wallRows.length - 1; r++) {
    const [p, q] = [wallRows[r], wallRows[r + 1]].map(({ py, hw }) => ({ y: toY(py), ...ovalPoint(hw / 1000, ea) }));
    for (const side of [-1, 1]) {
      quad([side * p.x, p.y, -p.z], [side * p.x, p.y, p.z], [side * q.x, q.y, q.z], [side * q.x, q.y, -q.z]);
    }
    quad([-p.x, p.y, 0], [p.x, p.y, 0], [q.x, q.y, 0], [-q.x, q.y, 0]);
  }
  const ceilingY = toY(NOTCH_TOP);
  const floorY = 0.0008;
  const ceilingHw = profile(BODY, NOTCH_TOP) / 1000;
  const floorHw = profile(BODY, BOTTOM_Y - 3) / 1000;
  const steps = 48;
  for (let i = 0; i < steps; i++) {
    const k = (s: number) => ea + ((Math.PI - 2 * ea) * s) / steps;
    const [p, q] = [ovalPoint(ceilingHw, k(i)), ovalPoint(ceilingHw, k(i + 1))];
    quad([p.x, ceilingY, p.z], [p.x, ceilingY, -p.z], [q.x, ceilingY, -q.z], [q.x, ceilingY, q.z]);
    const [f, g] = [ovalPoint(floorHw, k(i)), ovalPoint(floorHw, k(i + 1))];
    quad([f.x, floorY, f.z], [f.x, floorY, -f.z], [g.x, floorY, -g.z], [g.x, floorY, g.z]);
  }
  const channelGeometry = new THREE.BufferGeometry();
  channelGeometry.setAttribute("position", new THREE.Float32BufferAttribute(channel, 3));
  channelGeometry.computeVertexNormals();
  group.add(new THREE.Mesh(channelGeometry, shadowed));

  // Twist knob: ribbed dial in the notch, with a smooth rim on top
  const knobHeight = (KNOB.bottom - KNOB.top) / 1000;
  const knob = new THREE.CylinderGeometry(KNOB.radius / 1000, KNOB.radius / 1000, knobHeight, KNOB.ribs * 8, 1);
  const pos = knob.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < KNOB.radius / 1000 - 1e-4) continue; // cap centres
    const a = Math.atan2(z, x);
    const scale = (r + (KNOB.ribDepth / 1000) * Math.cos(a * KNOB.ribs)) / r;
    pos.setXYZ(i, x * scale, pos.getY(i), z * scale);
  }
  knob.computeVertexNormals();
  knob.translate(0, toY(KNOB.bottom) + knobHeight / 2, 0);
  group.add(new THREE.Mesh(knob, knobMaterial));
  const rim = new THREE.CylinderGeometry((KNOB.radius + 5) / 1000, (KNOB.radius + 5) / 1000, 0.006, 96);
  rim.translate(0, toY(KNOB.top), 0);
  group.add(new THREE.Mesh(rim, knobMaterial));

  // Label: wrapped by arc length (flat print width → angle around the stick), a hair proud of the surface
  if (label) {
    const cols = 64;
    const labelRows = rows(
      [
        [LABEL.top, 0],
        [LABEL.top + LABEL.height, 0],
      ],
      6,
    ).map(({ py }) => py);
    const positions: number[] = [];
    const uvs: number[] = [];
    const indices: number[] = [];
    for (const py of labelRows) {
      const hw = profile(BODY, py) / 1000;
      for (let c = 0; c <= cols; c++) {
        const px = LABEL.left + (LABEL.width * c) / cols;
        const angle = (px - CENTER_X) / LABEL_RADIUS;
        const { x, z } = ovalPoint(hw + 0.0004, Math.PI / 2 - angle);
        positions.push(x, toY(py), z);
        uvs.push(c / cols, 1 - (py - LABEL.top) / LABEL.height);
      }
    }
    for (let r = 0; r < labelRows.length - 1; r++) {
      for (let c = 0; c < cols; c++) {
        const a = r * (cols + 1) + c;
        const b = a + 1;
        const d = a + cols + 1;
        const e = d + 1;
        indices.push(a, d, b, b, d, e);
      }
    }
    const labelGeometry = new THREE.BufferGeometry();
    labelGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    labelGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    labelGeometry.setIndex(indices);
    labelGeometry.computeVertexNormals();
    const print = new THREE.MeshPhysicalMaterial({
      map: label,
      transparent: true,
      roughness: 0.45,
      clearcoat: 0.25,
      clearcoatRoughness: 0.5,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    });
    group.add(new THREE.Mesh(labelGeometry, print));
  }

  return group;
}
