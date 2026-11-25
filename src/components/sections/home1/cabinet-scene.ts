/*
 * The /home1 bathroom cabinet, laid out in the pixels of the original photo
 * (public/images/newhome/hero_bg_1.png, 1672 × 941).
 *
 * The scene image (newhome/cabinet/scene.jpg) is that photo with what the page animates painted out —
 * the open door, the towel, the plant's leaves — set into more of the same wall: 800px to its left,
 * 600px to its right and 900px above, so it can fill any screen. towel.png and plant.png are the towel
 * and the leaves, cut out of the photo at its own scale. Everything below is in the photo's pixels;
 * `place` turns a rect into % of the scene box.
 */

export const SCENE = { src: "/images/newhome/cabinet/scene.jpg", width: 3072, height: 1841, x: 800, y: 900 };

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
  src: "/images/newhome/cabinet/plant.png",
  x: 673,
  y: 22,
  w: 187,
  h: 92,
  pivot: { x: 741, y: 98 },
};

/** The towel, hanging over the ring's bar along its top `pin` rows */
export const TOWEL = { src: "/images/newhome/cabinet/towel.png", x: 1176, y: 674, w: 160, h: 243, pin: 16 };

export type Compartment = "left" | "right" | "cubby";
type Range = "balanced" | "grounded" | "kinetic" | "renewed";
type View = "front" | "angle";

/** Where the stick is in each product shot (3840 × 2160, on white), in % — the reflection under it left out */
export const SHOTS: Record<View, { x: number; y: number; w: number; h: number }> = {
  front: { x: 38.1, y: 4.6, w: 23.8, h: 85.4 },
  angle: { x: 38.6, y: 4.6, w: 22.2, h: 85 },
};
export const SHOT_SIZE = { width: 3840, height: 2160 };

const SCENTS: Record<Range, string> = {
  balanced: "Citrus Tide",
  grounded: "Amber Wood",
  kinetic: "Silver Lining",
  renewed: "Forest Air",
};

export interface CabinetProduct {
  range: Range;
  view: View;
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

export const PRODUCTS: CabinetProduct[] = [
  // Behind the left door (its compartment is the right one, mirrored)
  { range: "grounded", view: "front", compartment: "left", x: 642, base: UPPER },
  { range: "renewed", view: "angle", compartment: "left", x: 732, base: UPPER },
  { range: "kinetic", view: "front", compartment: "left", x: 646, base: LOWER },
  { range: "balanced", view: "angle", compartment: "left", x: 736, base: LOWER },
  // Behind the right door
  { range: "balanced", view: "front", compartment: "right", x: 880, base: UPPER, hero: true },
  { range: "kinetic", view: "angle", compartment: "right", x: 972, base: UPPER },
  { range: "renewed", view: "front", compartment: "right", x: 876, base: LOWER },
  { range: "grounded", view: "angle", compartment: "right", x: 968, base: LOWER },
  // The open cubby: the whole range
  { range: "kinetic", view: "front", compartment: "cubby", x: 668, base: CUBBY },
  { range: "balanced", view: "front", compartment: "cubby", x: 768, base: CUBBY },
  { range: "renewed", view: "front", compartment: "cubby", x: 868, base: CUBBY },
  { range: "grounded", view: "front", compartment: "cubby", x: 968, base: CUBBY },
];

/** Every stick stands this tall, in the photo's pixels (about 14cm against the cabinet) */
export const STICK_HEIGHT = 128;

export const productInfo = (range: Range) => ({
  slug: `sava-${range}`,
  name: `Sava ${range[0].toUpperCase()}${range.slice(1)}`,
  scent: SCENTS[range],
  src: (view: View) => `/images/products/${range}/sava-${range}-${view}.jpg`,
});

/** A product's rect in the photo's pixels */
export function productRect({ view, x, base }: CabinetProduct): Rect {
  const shot = SHOTS[view];
  const aspect = (shot.w * SHOT_SIZE.width) / (shot.h * SHOT_SIZE.height);
  const w = STICK_HEIGHT * aspect;
  return { x: x - w / 2, y: base - STICK_HEIGHT, w, h: STICK_HEIGHT };
}

/** CroppedImage's crop to show just the stick of a product shot */
export const shotCrop = (view: View) => {
  const { x, y, w, h } = SHOTS[view];
  return { width: (100 / w) * 100, height: (100 / h) * 100, left: (-x / w) * 100, top: (-y / h) * 100 };
};

/*
 * The photo of the open hand holding the stick, as on the home page's features (public/images/home/features-*),
 * shown instead of the 3D hand where there's no WebGL: the hand and the stick in it, both 1460 × 1350, and
 * the shadow the stick casts on the palm, in % of that frame.
 */
export const HAND = {
  width: 1460,
  height: 1350,
  shadow: { left: 43, top: 59.5, width: 24, height: 4 },
};
