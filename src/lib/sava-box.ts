import type * as Three from "three";

type THREE = typeof Three;

/*
 * The SAVA Balanced carton, built in code around its printed face (public/images/newhome/sava_box.png,
 * cropped inside its edge highlights to sava-box-front.webp). A tuck-end box: four walls and a floor of
 * thin board, a lid hinged along the back's top edge with a tuck flap at its front, and a dust flap on
 * each side wall's top edge. Sizes are in units of its height; it's centred on its middle, the print
 * facing +z.
 */

/** The printed face, the carton's front */
export const BOX_FRONT = { src: "/images/newhome/sava-box-front.webp", width: 570, height: 1173 };

/** The carton's photo, edges and all, which stands in for it without WebGL; `box` is the carton's rect in it */
export const BOX_PHOTO = {
  src: "/images/newhome/sava_box.png",
  width: 1086,
  height: 1448,
  box: { x: 249, y: 124, w: 587, h: 1202 },
};

/** Width from the print's own shape; deep enough for the stick's oval (src/lib/sava-stick.ts) */
export const BOX = { width: BOX_FRONT.width / BOX_FRONT.height, height: 1, depth: 0.34, board: 0.006 };

// Panel colours, sampled from the print: its deep band for the sides and back, its light blue for the
// lid; plain white board inside and on the cut edges
const SIDE = 0x3a64aa;
const LID = 0xa7caed;
const INSIDE = 0xeef2f7;
const EDGE = 0xdfe7f1;

// How far each part swings open (radians): the lid back past upright, its tuck flap out, the dust flaps
// up and outward
const LID_OPEN = 1.95;
const TUCK_OPEN = 1.2;
const FLAP_OPEN = 1.98;

const smooth = (v: number) => {
  const t = Math.min(1, Math.max(0, v));
  return t * t * (3 - 2 * t);
};

export function createSavaBox(THREE: THREE, print?: Three.Texture) {
  const { width: w, height: h, depth: d, board: t } = BOX;
  const material = (color: number, map?: Three.Texture) =>
    new THREE.MeshStandardMaterial({ color: map ? 0xffffff : color, map: map ?? null, roughness: 0.6 });
  const side = material(SIDE);
  const inside = material(INSIDE);
  const edge = material(EDGE);
  const lidTop = material(LID);
  const front = print ? material(0xffffff, print) : lidTop;

  // A board panel; `faces` in BoxGeometry's order: +x, -x, +y, -y, +z, -z
  const panel = (
    size: [number, number, number],
    faces: Three.Material[],
    at: [number, number, number],
    parent: Three.Object3D,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), faces);
    mesh.position.set(...at);
    parent.add(mesh);
    return mesh;
  };

  const group = new THREE.Group();
  panel([w, h, t], [edge, edge, edge, edge, front, inside], [0, 0, d / 2 - t / 2], group);
  panel([w, h, t], [edge, edge, edge, edge, inside, side], [0, 0, -d / 2 + t / 2], group);
  panel([t, h, d - 2 * t], [side, inside, edge, edge, edge, edge], [w / 2 - t / 2, 0, 0], group);
  panel([t, h, d - 2 * t], [inside, side, edge, edge, edge, edge], [-w / 2 + t / 2, 0, 0], group);
  panel([w - 2 * t, t, d - 2 * t], [edge, edge, inside, side, edge, edge], [0, -h / 2 + t / 2, 0], group);

  // The lid, hinged along the back's top edge: shut, it lies across the top, its tuck flap down inside the front
  const lid = new THREE.Group();
  lid.position.set(0, h / 2, -d / 2);
  group.add(lid);
  panel([w, t, d], [edge, edge, lidTop, inside, edge, edge], [0, t / 2, d / 2], lid);
  const tuckLength = d * 0.55;
  const tuck = new THREE.Group();
  tuck.position.set(0, 0, d - t);
  lid.add(tuck);
  panel([w - 4 * t, tuckLength, t], [edge, edge, edge, edge, lidTop, inside], [0, -tuckLength / 2, -t / 2], tuck);

  // The dust flaps, on the side walls' top edges: shut, they fold in flat under the lid
  const flapLength = w * 0.3;
  const flaps = [-1, 1].map((sign) => {
    const flap = new THREE.Group();
    flap.position.set(sign * (w / 2 - t), h / 2, 0);
    group.add(flap);
    panel(
      [flapLength, t, d - 4 * t],
      [edge, edge, inside, inside, edge, edge],
      [-sign * (flapLength / 2), -1.5 * t, 0],
      flap,
    );
    return { flap, sign };
  });

  /**
   * 0 = shut, 1 = open. Opening, the lid swings back first and the dust flaps follow; shutting, the
   * flaps fold in first, and the tuck flap tucks in as the lid comes down
   */
  const open = (amount: number) => {
    lid.rotation.x = -LID_OPEN * smooth(amount / 0.7);
    tuck.rotation.x = -TUCK_OPEN * smooth(amount / 0.45);
    const out = smooth((amount - 0.3) / 0.7);
    for (const { flap, sign } of flaps) flap.rotation.z = -sign * FLAP_OPEN * out;
  };
  open(0);

  return { group, open };
}

export type SavaBox = ReturnType<typeof createSavaBox>;
