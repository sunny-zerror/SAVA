import CareGallery from "@/components/sections/new-home/CareGallery";
import CroppedImage from "@/components/ui/CroppedImage";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { CARE_POSTERS, SHELF_FEATURE } from "@/data/care-slides";
import { BOX_PHOTO } from "@/lib/sava-box";
import { cn } from "@/utils/cn";
import CabinetPackMotion from "./CabinetPackMotion";

// Lines of the heading, each in its own mask (bleed so nothing's cropped)
const LINES = ["Protection", "Meets Care"];

/** Where the carton stands on the shelf photo (SHELF_FEATURE): its rect in that photo's pixels */
const SHELF_SPOT = { x: 547, y: 752, w: 100, h: 205, photo: { w: 1086, h: 1448 } };

/** The carton's photo, cut from its transparent margins */
const boxCrop = {
  width: (BOX_PHOTO.width / BOX_PHOTO.box.w) * 100,
  height: (BOX_PHOTO.height / BOX_PHOTO.box.h) * 100,
  left: (-BOX_PHOTO.box.x / BOX_PHOTO.box.w) * 100,
  top: (-BOX_PHOTO.box.y / BOX_PHOTO.box.h) * 100,
};

/**
 * "Protection Meets Care" on /home1: the stick from the middle bestseller card lands over the middle
 * as the section pins (CabinetTraveller), and the scroll packs it (CabinetPackMotion): the heading
 * sweeps past behind as one huge line, as on /home, while the carton rises in under the stick and
 * opens, the stick drops in and the carton shuts; the closed carton comes to rest in the middle,
 * facing straight out, as the line shrinks onto the heading. Then /home's photo card opens round it
 * (CareGallery), the carton settling into its gap on the first photo's shelf, and the photos step
 * through (posters of their own, src/data/care-slides.ts), the carton riding out on its shelf.
 *
 * --box-h is the carton's height while it's packed, with the stick's own height over it; --end-h its
 * height at rest. The slots are measured by CabinetTraveller every frame, the carton drawn in 3D over
 * them. With reduced motion it's the finished layout: the heading beside the shelf photo, its carton in place.
 */
export default function CabinetPack() {
  return (
    <CabinetPackMotion aria-labelledby="home1-pack" className="relative isolate overflow-hidden bg-paper">
      <Frame>
        <FrameRule />

        <div
          data-pack-stage
          className="relative h-svh [--box-h:calc((100svh-var(--spacing-header)-8rem)/1.95)] [--end-h:min(calc(100svh-var(--spacing-header)-5rem),62svh)] max-md:[--box-h:calc((100svh-var(--spacing-header)-10rem)/1.95)] max-md:[--end-h:min(calc(100svh-var(--spacing-header)-12rem),58svh)]"
        >
          {/* The heading as one huge line, swept past behind the carton (decorative: the h2 is the real one) */}
          <p
            aria-hidden="true"
            data-pack-big
            className="pointer-events-none absolute top-0 left-0 text-display whitespace-nowrap motion-safe:opacity-0 motion-reduce:hidden"
          >
            Protection Meets Care
          </p>

          {/* Packing: where the stick lands, and the carton under it, in the space below the header */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-(--spacing-header) bottom-0 flex flex-col items-center justify-center motion-reduce:hidden"
          >
            <div data-model-anchor="pack" className="h-[calc(var(--box-h)*0.86)] w-[calc(var(--box-h)*0.5)]" />
            <div
              data-model-anchor="box"
              className="relative mt-[calc(var(--box-h)*0.04)] h-(--box-h) w-[calc(var(--box-h)*0.486)]"
            >
              <Shadow at="box" />
            </div>
          </div>

          {/* The photo card, centred on where the closed carton rests (on phones, under the heading) */}
          <CareGallery
            slides={[SHELF_FEATURE, ...CARE_POSTERS]}
            fadeThumbs={false}
            renderFirst={(where) => <ShelfBox anchor={where === "card"} />}
            className="top-[calc(var(--spacing-header)+9rem)] md:top-(--spacing-header)"
          >
            <div data-model-anchor="box-end" className="absolute h-(--end-h) w-[calc(var(--end-h)*0.486)]">
              <Shadow at="end" />
              {/* Without the 3D carton, its photo (with reduced motion it's on the shelf from the start) */}
              <CroppedImage
                src={BOX_PHOTO.src}
                alt="Sava Balanced in its carton"
                width={BOX_PHOTO.width}
                height={BOX_PHOTO.height}
                crop={boxCrop}
                sizes="(min-width: 48rem) 40rem, 110vw"
                className="size-full motion-reduce:hidden model-ready:invisible"
              />
            </div>
          </CareGallery>

          {/* Label + heading, top left; with room beside the stick, the motion starts the label level with it */}
          <div className="absolute top-[calc(var(--spacing-header)+1rem)] left-0 z-20 px-inset md:top-[calc(var(--spacing-header)+8svh)]">
            <p data-pack-kicker className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              Performance meets personal care
            </p>
            <h2 id="home1-pack" data-pack-title className="mt-4 motion-safe:opacity-0">
              {LINES.map((line) => (
                <span key={line} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                  <span data-pack-line className="block">
                    {line}
                  </span>
                </span>
              ))}
            </h2>
          </div>
        </div>
      </Frame>
    </CabinetPackMotion>
  );
}

/** A soft contact shadow under the 3D carton (only drawn with it), faded in and out by the motion */
function Shadow({ at }: { at: "box" | "end" }) {
  return (
    <span
      aria-hidden="true"
      data-pack-shadow={at}
      className="absolute -inset-x-1/4 bottom-0 hidden h-[7%] translate-y-1/2 rounded-[50%] bg-ink/20 opacity-0 blur-md model-ready:block"
    />
  );
}

/**
 * The carton in its gap on the shelf photo, turning and zooming with the photo as it goes. In the card
 * it's where the 3D carton settles ([data-model-anchor="box-shelf"]): hidden while that one's drawn,
 * shown once it's placed (CabinetTraveller sets data-placed), so it rides out clipped with its photo
 */
function ShelfBox({ anchor }: { anchor: boolean }) {
  return (
    <div
      data-model-anchor={anchor ? "box-shelf" : undefined}
      className={cn("absolute", anchor && "model-ready:invisible model-ready:data-placed:visible")}
      style={{
        left: `${(SHELF_SPOT.x / SHELF_SPOT.photo.w) * 100}%`,
        top: `${(SHELF_SPOT.y / SHELF_SPOT.photo.h) * 100}%`,
        width: `${(SHELF_SPOT.w / SHELF_SPOT.photo.w) * 100}%`,
        height: `${(SHELF_SPOT.h / SHELF_SPOT.photo.h) * 100}%`,
      }}
    >
      {/* Its contact shadow on the shelf */}
      <span className="absolute -inset-x-[12%] bottom-0 h-[5%] translate-y-1/2 rounded-[50%] bg-ink/35 blur-[3px]" />
      <CroppedImage
        src={BOX_PHOTO.src}
        width={BOX_PHOTO.width}
        height={BOX_PHOTO.height}
        crop={boxCrop}
        sizes="8rem"
        className="size-full"
      />
    </div>
  );
}
