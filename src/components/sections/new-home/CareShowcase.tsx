import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { CARE_FILMS, MAIN_FEATURE } from "@/data/care-slides";
import CareGallery from "./CareGallery";
import CareShowcaseMotion from "./CareShowcaseMotion";

// Lines of the heading, each in its own mask (bleed so nothing's cropped)
const LINES = ["Protection", "Meets Care"];

/**
 * "Protection Meets Care": pinned for a long scroll (CareShowcaseMotion), after the oryzo.ai
 * "So portable, it's wearable" scene. The travelling 3D stick (HeroStick) lands in a viewfinder ring
 * while the heading sweeps past behind it as one huge line; the line shrinks into the heading, the
 * card opens round the stick (80% of the screen, like oryzo's frame) and the stick settles into the
 * first photo's dashed circle. Then the photos step through the card one at a time — the stick riding
 * out with the first — the next ones queued in a strip on the right and the ones gone by in a strip
 * on the left, each strip clipped short of the card (CareGallery). Sizes are CSS variables, so the
 * motion reads them back rather than hard-coding them. With reduced motion it's the finished layout.
 */
export default function CareShowcase() {
  return (
    <CareShowcaseMotion aria-labelledby="care-heading" className="relative isolate overflow-hidden bg-paper">
      <Frame>
        <FrameRule />

        <div data-care-stage className="relative h-svh">
          {/* The heading as one huge line, swept past behind the stick (decorative: the h2 is the real one) */}
          <p
            aria-hidden="true"
            data-care-big
            className="pointer-events-none absolute top-0 left-0 text-display whitespace-nowrap motion-safe:opacity-0 motion-reduce:hidden"
          >
            Protection Meets Care
          </p>

          {/* Everything that centres on the card: in the space under the header (on phones, under the heading) */}
          <CareGallery
            slides={[MAIN_FEATURE, ...CARE_FILMS]}
            // The first photo's dashed circle (48.2% across, 49.65% down, 26.1% of its width): where the
            // stick settles as the card opens, riding out with the photo after. Outside the turning
            // layer, so the stick doesn't swell with its zoom
            firstOver={
              <div
                data-model-anchor="circle"
                data-model-fit="0.85"
                className="absolute top-[39.9%] left-[35.15%] aspect-square w-[26.1%]"
              />
            }
            className="top-[calc(var(--spacing-header)+8rem)] [--care-s:calc(var(--care-h)*0.6)] md:top-(--spacing-header)"
          >
            {/* Viewfinder: a dashed ring with four ticks around the stick, turned and faded out by the motion */}
            <div aria-hidden="true" data-care-reticle className="absolute z-20 size-(--care-s) motion-reduce:hidden">
              <span className="absolute inset-[8%] rounded-full border border-dashed border-ink/20" />
              <span className="absolute top-[8%] left-1/2 h-3 w-px -translate-x-1/2 bg-accent" />
              <span className="absolute bottom-[8%] left-1/2 h-3 w-px -translate-x-1/2 bg-accent" />
              <span className="absolute top-1/2 left-[8%] h-px w-3 -translate-y-1/2 bg-accent" />
              <span className="absolute top-1/2 right-[8%] h-px w-3 -translate-y-1/2 bg-accent" />
            </div>

            {/* Where the travelling stick lands (HeroStick) */}
            <div data-model-anchor="care" data-model-fit="0.8" className="absolute size-(--care-s)" />
          </CareGallery>

          {/* Label + heading, top left; with room beside the viewfinder, the motion starts the label level with the stick */}
          <div className="absolute top-[calc(var(--spacing-header)+1rem)] left-0 z-20 px-inset md:top-[calc(var(--spacing-header)+8svh)]">
            <p data-care-kicker className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              Performance meets personal care
            </p>
            <h2 id="care-heading" data-care-title className="mt-4 motion-safe:opacity-0">
              {LINES.map((line) => (
                <span key={line} className="-mb-[0.12em] block overflow-hidden pb-[0.12em]">
                  <span data-care-line className="block">
                    {line}
                  </span>
                </span>
              ))}
            </h2>
          </div>
        </div>
      </Frame>
    </CareShowcaseMotion>
  );
}
