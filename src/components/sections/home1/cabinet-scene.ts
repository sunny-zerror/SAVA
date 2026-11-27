/*
 * The /home1 bathroom cabinet, laid out in the pixels of the original photo
 * (public/images/newhome/hero_bg_1.png, 1672 × 941).
 *
 * The scene is two layers in one box, the photo set into it with room around: 800px to its left, 600px
 * to its right and 900px above, so it can fill any screen. Behind, the wall (newhome/cabinet/wall.jpg):
 * newhome/hero_only_bg.png — the photo's wall in SAVA blue, board for board — carried on to fill the box.
 * In front, the cabinet (newhome/cabinet/cabinet.webp) on transparency, with what the page animates taken
 * out: the open door, the towel, the plant's leaves. Both are built from their sources by
 * scripts/cabinet-layers.mjs (the cabinet is keyed out of newhome/cabinet/scene.jpg, the photo extended
 * on its old teal wall); rerun it when either changes. towel.webp and plant.webp are the towel and the
 * leaves, cut out of the photo at its own scale (from towel.png and plant.png, the teal at their edges
 * keyed away by the same script). Everything below is in the photo's pixels; `place` turns a rect into
 * % of the scene box.
 */

export const SCENE = {
  /** The cabinet: the front layer, and what the doors and shelf edges are cut from */
  src: "/images/newhome/cabinet/cabinet.webp",
  /** The wall behind it */
  wall: "/images/newhome/cabinet/wall.jpg",
  width: 3072,
  height: 1841,
  x: 800,
  y: 900,
};

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A rect in the photo's pixels, as CSS position and size in % of the scene box */
export const place = ({ x, y, w, h }: Rect) => ({
  left: `${((x + SCENE.x) / SCENE.width) * 100}%`,
  top: `${((y + SCENE.y) / SCENE.height) * 100}%`,
  width: `${(w / SCENE.width) * 100}%`,
  height: `${(h / SCENE.height) * 100}%`,
});

/** CroppedImage's crop to show rect `r` of the scene image in a box of r's size */
export const sceneCrop = ({ x, y, w, h }: Rect) => ({
  width: (SCENE.width / w) * 100,
  height: (SCENE.height / h) * 100,
  left: (-(x + SCENE.x) / w) * 100,
  top: (-(y + SCENE.y) / h) * 100,
});

/** Where the photo was taken from: its eye height, and how far back (for the doors' perspective) */
export const CAMERA = { x: 836, y: 470, distance: 2600 };

/** The carcass runs 527–1082 across, the top and bottom boards 520–1089 */
export const CABINET = {
  centre: 804,
  halfWidth: 284,
  /** The closed left door; the right door shuts over the opening beside it */
  leftDoor: { x: 543, y: 201, w: 264, h: 392 },
  rightDoor: { x: 808, y: 201, w: 258, h: 392 },
  /** The upper shelf's front edge: laid over what stands on it, which stands just behind it */
  shelfLip: { x: 808, y: 388, w: 258, h: 15 },
  /** How thick the doors are */
  doorDepth: 14,
};

/** How far each door swings: at rest the right one stands open, as in the photo */
export const DOOR = { open: 108, max: 116, rest: { left: 0, right: 104 } };

/** The leaves, cut out above the vase; they bend from where the stems leave its mouth */
export const PLANT = {
  src: "/images/newhome/cabinet/plant.webp",
  x: 673,
  y: 22,
  w: 187,
  h: 92,
  pivot: { x: 741, y: 98 },
};

/** The towel, hanging over the ring's bar along its top `pin` rows */
export const TOWEL = { src: "/images/newhome/cabinet/towel.webp", x: 1176, y: 674, w: 160, h: 243, pin: 16 };

export type Compartment = "left" | "right" | "cubby";
/** The ranges the cabinet stocks: the bestsellers' three, the ones with a 3D stick (Grounded has none yet) */
type Range = "balanced" | "kinetic" | "renewed";
/**
 * Each range's stick facing straight out on transparency (public/images/newhome/sticks/sava-<range>-3d.webp):
 * renders of the 3D stick itself (src/lib/sava-stick.ts, drawn by src/lib/stick-stage.ts as the bestsellers'
 * are, filling the image's height), so a stick on a shelf and its 3D twin look the same and the hero stick
 * swaps to its 3D self unseen as it leaves. Their size in pixels, the same for each
 */
export const STICK_IMAGE = { width: 784, height: 1440 };

const SCENTS: Record<Range, string> = {
  balanced: "Citrus Tide",
  kinetic: "Silver Lining",
  renewed: "Forest Air",
};

export interface CabinetProduct {
  range: Range;
  compartment: Compartment;
  /** The stick's centre across, and where its base stands, in the photo's pixels */
  x: number;
  base: number;
  /** The hero stick: as the page scrolls, it leaves the shelf for the hand (CabinetTraveller) */
  hero?: boolean;
}

/** Upper shelf: on it, behind its front edge. Lower shelf and cubby: on their floors */
const UPPER = 395;
const LOWER = 574;
const CUBBY = 766;

/** Stocked with the bestsellers' three (CabinetBestsellers): each compartment holds all three */
export const PRODUCTS: CabinetProduct[] = [
  // Behind the left door (its compartment is the right one, mirrored)
  { range: "kinetic", compartment: "left", x: 642, base: UPPER },
  { range: "renewed", compartment: "left", x: 732, base: UPPER },
  { range: "balanced", compartment: "left", x: 646, base: LOWER },
  { range: "kinetic", compartment: "left", x: 736, base: LOWER },
  // Behind the right door
  { range: "balanced", compartment: "right", x: 880, base: UPPER },
  { range: "kinetic", compartment: "right", x: 972, base: UPPER },
  { range: "renewed", compartment: "right", x: 876, base: LOWER },
  { range: "balanced", compartment: "right", x: 968, base: LOWER },
  // The open cubby: the range, in the bestsellers' order, Balanced in the middle — the hero, which leaves
  // its shelf for the bestsellers as the page scrolls, no door in its way
  { range: "kinetic", compartment: "cubby", x: 703, base: CUBBY },
  { range: "balanced", compartment: "cubby", x: 818, base: CUBBY, hero: true },
  { range: "renewed", compartment: "cubby", x: 933, base: CUBBY },
];

/** Every stick stands this tall, in the photo's pixels (about 14cm against the cabinet) */
export const STICK_HEIGHT = 128;

export const productInfo = (range: Range) => ({
  slug: `sava-${range}`,
  name: `Sava ${range[0].toUpperCase()}${range.slice(1)}`,
  scent: SCENTS[range],
  src: `/images/newhome/sticks/sava-${range}-3d.webp`,
});

/** A catalogue product's stick on transparency, by slug ("sava-kinetic" → sticks/sava-kinetic-3d.webp); null if it has none */
export function stickCutoutFor(slug: string) {
  const range = slug.replace(/^sava-/, "");
  return range in SCENTS ? productInfo(range as Range).src : null;
}

/** A product's rect in the photo's pixels */
export function productRect({ x, base }: CabinetProduct): Rect {
  const w = (STICK_HEIGHT * STICK_IMAGE.width) / STICK_IMAGE.height;
  return { x: x - w / 2, y: base - STICK_HEIGHT, w, h: STICK_HEIGHT };
}
