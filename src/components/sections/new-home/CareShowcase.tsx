import Image from "next/image";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import CareShowcaseMotion from "./CareShowcaseMotion";

interface Slide {
  src: string;
  alt: string;
  /** Caption card over the photo; the first photo carries its own feature callouts instead */
  title?: string;
  text?: string;
  /** object-position for photos of another shape, so the crop keeps their subject in frame */
  position?: string;
}

// The card (and each thumbnail) has the main photo's shape, 1792 × 2400, so that one shows whole and its circle
// stays put; the others are cropped to it — landscape ones down to about half their width
const SLIDES: Slide[] = [
  {
    src: "/images/newhome/main_feature.png",
    alt: "A raised underarm marked with a dashed circle, beside four callouts: dermatologist approved, no parabens or artificial dyes, stain-free on white clothes, gentle for everyday use",
  },
  {
    src: "/images/about/confidence_img_1.png",
    alt: "A neck beaded with sweat after a workout",
    title: "Advanced sweat control",
    text: "Stays fresh through every move, every commute, and everything in between.",
  },
  {
    src: "/images/about/gym_img.png",
    alt: "A man in a white hoodie running on a treadmill against a blue wall",
    title: "Made for active lifestyles",
    text: "Daily commutes, training sessions and long, warm days.",
    // The runner and treadmill fill the photo's left half; centred, the crop cut him off at the card's edge
    position: "5% 50%",
  },
  {
    src: "/images/about/confidence_img_3.png",
    alt: "A shoulder beaded with water, in a red sports top",
    title: "Stain-free guarantee",
    text: "Tested on white cotton and delicate silks with zero residue transfer.",
  },
  {
    src: "/images/about/confidence_img_2.png",
    alt: "A lab technician measuring out a formula",
    title: "ISO 22716 certified",
    text: "Made to cosmetic GMP standards with traceable batches.",
  },
  {
    src: "/images/about/banner.png",
    alt: "SAVA sticks laid out on dark fabric",
    title: "Refined fragrance",
    text: "Three signature scents: Silver Lining, Citrus Tide and Forest Air.",
  },
];

// Lines of the heading, each in its own mask (bleed so nothing's cropped)
const LINES = ["Protection", "Meets Care"];

/**
 * "Protection Meets Care": pinned for a long scroll (CareShowcaseMotion), after the oryzo.ai
 * "So portable, it's wearable" scene. The travelling 3D stick (HeroStick) lands in a viewfinder ring
 * while the heading sweeps past behind it as one huge line; the line shrinks into the heading, the
 * card opens round the stick (80% of the screen, like oryzo's frame) and the stick settles into the
 * first photo's dashed circle. Then the photos step through the card one at a time — the stick riding
 * out with the first — the next ones queued in a strip on the right and the ones gone by in a strip
 * on the left, each strip clipped short of the card. Sizes are CSS variables, so the motion
 * reads them back rather than hard-coding them. With reduced motion it's the finished layout.
 */
export default function CareShowcase() {
  return (
    <CareShowcaseMotion aria-labelledby="care-heading" className="relative isolate overflow-hidden bg-paper">
      <Frame>
        <FrameRule />

        <div
          data-care-stage
          className="relative h-svh [--care-h:min(80svh,calc(100svh-var(--spacing-header)-3rem),105vw)] [--care-s:calc(var(--care-h)*0.6)] [--care-w:calc(var(--care-h)*0.7467)] [--strip-gap:1.25rem] [--thumb-gap:0.875rem] [--thumb-h:calc(var(--care-h)*0.35)] [--thumb-w:calc(var(--thumb-h)*0.7467)] max-md:[--care-h:min(calc(100svh-var(--spacing-header)-10rem),105vw)]"
        >
          {/* The heading as one huge line, swept past behind the stick (decorative: the h2 is the real one) */}
          <p
            aria-hidden="true"
            data-care-big
            className="pointer-events-none absolute top-0 left-0 text-display whitespace-nowrap motion-safe:opacity-0 motion-reduce:hidden"
          >
            Protection Meets Care
          </p>

          {/* Everything that centres on the card: in the space under the header (on phones, under the heading) */}
          <div className="absolute inset-x-0 top-[calc(var(--spacing-header)+8rem)] bottom-0 flex items-center justify-center md:top-(--spacing-header)">
            {/* The card's finished size, for the motion to measure */}
            <div aria-hidden="true" data-care-sizer className="invisible absolute h-(--care-h) w-(--care-w)" />

            {/* The strips, clipped short of the card and running out to the screen's edges. Left: the photos
                gone by, queued from just past its inner edge (hidden until they step out). Right: the
                photos still to come, from its inner edge. Both shift one thumbnail per photo. */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-[calc(50%+var(--care-w)/2+var(--strip-gap))] left-[calc((100%-100vw)/2)] overflow-hidden"
            >
              <div
                data-care-track="left"
                className="absolute top-1/2 left-full flex -translate-y-1/2 gap-(--thumb-gap) pl-(--thumb-gap) motion-safe:opacity-0"
              >
                {SLIDES.map((slide) => (
                  <Thumb key={slide.src} src={slide.src} position={slide.position} />
                ))}
              </div>
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-y-0 right-[calc((100%-100vw)/2)] left-[calc(50%+var(--care-w)/2+var(--strip-gap))] overflow-hidden"
            >
              <div
                data-care-track="right"
                className="absolute top-1/2 left-0 flex -translate-y-1/2 gap-(--thumb-gap) motion-safe:opacity-0"
              >
                {SLIDES.slice(1).map((slide) => (
                  <Thumb key={slide.src} src={slide.src} position={slide.position} />
                ))}
              </div>
            </div>

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

            {/* The card: the viewfinder's size at first, opened out as the photo fades in */}
            <div data-care-box className="relative z-10 h-(--care-h) w-(--care-w)">
              <div className="absolute inset-0 overflow-hidden rounded-3xl">
                {/* White behind the photos, so the huge line passes behind the card as it opens */}
                <div data-care-back className="absolute inset-0 bg-paper motion-safe:opacity-0" />
                <div data-care-slides className="absolute inset-0 motion-safe:opacity-0">
                  {SLIDES.map((slide, i) => (
                    <figure key={slide.src} data-care-slide className="absolute inset-0 bg-surface">
                      <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        sizes="(min-width: 48rem) 42rem, 90vw"
                        style={{ objectPosition: slide.position }}
                        className="object-cover"
                      />
                      {/* The first photo's dashed circle (48.2% across, 49.65% down, 26.1% of its width):
                          where the stick settles as the card opens, riding out with the photo after */}
                      {i === 0 && (
                        <div
                          data-model-anchor="circle"
                          data-model-fit="0.85"
                          className="absolute top-[39.9%] left-[35.15%] aspect-square w-[26.1%]"
                        />
                      )}
                      {slide.title && (
                        <figcaption className="absolute inset-x-3 bottom-3 rounded-2xl bg-paper/90 p-4 backdrop-blur-sm">
                          <p className="text-h6">{slide.title}</p>
                          <p className="mt-1 text-caption text-muted">{slide.text}</p>
                        </figcaption>
                      )}
                    </figure>
                  ))}
                </div>
              </div>
              <span aria-hidden="true" className="absolute top-4 right-4 size-2 rounded-full bg-accent" />
            </div>
          </div>

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

function Thumb({ src, position }: { src: string; position?: string }) {
  return (
    <div className="relative h-(--thumb-h) w-(--thumb-w) shrink-0 overflow-hidden rounded-2xl bg-surface">
      <Image src={src} alt="" fill sizes="16rem" style={{ objectPosition: position }} className="object-cover" />
    </div>
  );
}
