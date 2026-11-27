import Image from "next/image";
import CareShowcase from "@/components/sections/new-home/CareShowcase";
import { CARE_POSTERS, SHELF_FEATURE } from "@/data/care-slides";
import { cn } from "@/utils/cn";
import { STICK_IMAGE, productInfo } from "./cabinet-scene";

/**
 * Where the stick stands in the shelf photo (SHELF_FEATURE, 1086 × 1448): in the gap between the
 * toothbrushes and the towels, its base on the shelf, a little taller than the toothbrush pot. The box
 * is the stick's own shape, so the 3D stick and its photo fill it alike.
 */
const HEIGHT = 180;
const WIDTH = (HEIGHT * STICK_IMAGE.width) / STICK_IMAGE.height;
const SPOT = { x: 590 - WIDTH / 2, y: 957 - HEIGHT, w: WIDTH, h: HEIGHT, photo: { w: 1086, h: 1448 } };

/**
 * "Protection Meets Care" on /home1: /home's care showcase (CareShowcase), its first photo the bathroom
 * shelf. The stick from the middle bestseller card (CabinetTraveller) stands in the middle as the section
 * pins, the heading sweeping past behind it; then the card opens round it and it settles into its gap on
 * the shelf, where it hands over to its photo, and rides out with the shelf photo as /home1's posters
 * step through.
 */
export default function CabinetCare() {
  return (
    <CareShowcase
      first={{ slide: SHELF_FEATURE, render: (where) => <ShelfStick anchor={where === "card"} /> }}
      after={CARE_POSTERS}
      fadeThumbs={false}
      solidHeader
    />
  );
}

/**
 * The stick in its gap on the shelf photo, turning and zooming with the photo as it goes. In the card it's
 * where the 3D stick settles ([data-model-anchor="photo"]): hidden while that one's drawn, shown once it's
 * placed (CabinetTraveller sets data-placed). Without the 3D stick, or in the strip, it's there from the start.
 */
function ShelfStick({ anchor }: { anchor: boolean }) {
  return (
    <div
      data-model-anchor={anchor ? "photo" : undefined}
      className={cn("absolute", anchor && "model-ready:invisible model-ready:data-placed:visible")}
      style={{
        left: `${(SPOT.x / SPOT.photo.w) * 100}%`,
        top: `${(SPOT.y / SPOT.photo.h) * 100}%`,
        width: `${(SPOT.w / SPOT.photo.w) * 100}%`,
        height: `${(SPOT.h / SPOT.photo.h) * 100}%`,
      }}
    >
      {/* Its contact shadow on the shelf */}
      <span className="absolute inset-x-[4%] bottom-0 h-[5%] translate-y-1/2 rounded-[50%] bg-ink/35 blur-[3px]" />
      <Image src={productInfo("balanced").src} alt="" fill sizes="6rem" className="object-contain" />
    </div>
  );
}
