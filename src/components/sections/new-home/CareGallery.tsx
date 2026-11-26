import Image from "next/image";
import type { CareSlide } from "@/data/care-slides";
import { cn } from "@/utils/cn";

interface CareGalleryProps {
  slides: CareSlide[];
  /**
   * Laid over the first photo, turning and zooming with it as it goes — drawn in the card, and again
   * in its thumbnail
   */
  renderFirst?: (where: "card" | "thumb") => React.ReactNode;
  /** Laid over the first photo's slide outside its turning layer, so it holds its size as the photo zooms */
  firstOver?: React.ReactNode;
  /** Half-fade the strips' thumbnails, as oryzo's do, so the card keeps the eye (the default); false shows them whole */
  fadeThumbs?: boolean;
  /** Centred with the card, behind it: the slots the 3D sticks land in, say */
  children?: React.ReactNode;
  /** Where the space the card centres in starts, and any sizes of the page's own */
  className?: string;
}

/**
 * oryzo.ai's photo gallery, as on /home and /home1: a card with the photos (and films) stacked in it,
 * centred in the space it's given, the photos still to come queued in a strip to its right and those
 * gone by in a strip to its left, each strip clipped short of the card. Its section's motion opens the
 * card and steps through them (careGallery, src/lib/care-gallery.ts), reading the card's size from the
 * sizer: --care-h (80% of the screen, like oryzo's frame), --care-w the main photo's shape.
 */
export default function CareGallery({
  slides,
  renderFirst,
  firstOver,
  fadeThumbs = true,
  children,
  className,
}: CareGalleryProps) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 flex items-center justify-center [--care-h:min(80svh,calc(100svh-var(--spacing-header)-3rem),105vw)] [--care-w:calc(var(--care-h)*0.7467)] [--strip-gap:1.25rem] [--thumb-gap:0.875rem] [--thumb-h:calc(var(--care-h)*0.35)] [--thumb-w:calc(var(--thumb-h)*0.7467)] max-md:[--care-h:min(calc(100svh-var(--spacing-header)-10rem),105vw)]",
        className,
      )}
    >
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
          {slides.map((slide, i) => (
            <Thumb key={slide.src} slide={slide} faded={fadeThumbs}>
              {i === 0 && renderFirst?.("thumb")}
            </Thumb>
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
          {slides.slice(1).map((slide) => (
            <Thumb key={slide.src} slide={slide} faded={fadeThumbs} />
          ))}
        </div>
      </div>

      {children}

      {/* The card: opened out by the motion from the size of what stands in it */}
      <div data-care-box className="relative z-10 h-(--care-h) w-(--care-w)">
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {/* White behind the photos, so what passes behind the card stays behind it as it opens */}
          <div data-care-back className="absolute inset-0 bg-paper motion-safe:opacity-0" />
          <div data-care-slides className="absolute inset-0 motion-safe:opacity-0">
            {slides.map((slide, i) => (
              <div key={slide.src} data-care-slide className="absolute inset-0 overflow-hidden bg-surface">
                {/* Turned and zoomed by the motion as the slide comes in and goes out */}
                <figure data-care-inner className="absolute inset-0 will-change-transform">
                  {slide.video ? (
                    <video
                      muted
                      loop
                      playsInline
                      preload="none"
                      poster={slide.src}
                      aria-label={slide.alt}
                      style={{ objectPosition: slide.videoPosition }}
                      className="absolute inset-0 size-full object-cover"
                    >
                      <source src={slide.video} type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      src={slide.src}
                      alt={slide.alt}
                      fill
                      sizes="(min-width: 48rem) 42rem, 90vw"
                      style={{ objectPosition: slide.position }}
                      className="object-cover"
                    />
                  )}
                  {i === 0 && renderFirst?.("card")}
                  {slide.title && (
                    <figcaption className="absolute inset-x-3 bottom-3 rounded-2xl bg-paper/90 p-4 backdrop-blur-sm">
                      <p className="text-h6">{slide.title}</p>
                      <p className="mt-1 text-caption text-muted">{slide.text}</p>
                    </figcaption>
                  )}
                </figure>
                {i === 0 && firstOver}
              </div>
            ))}
          </div>
        </div>
        <span aria-hidden="true" data-care-dot className="absolute top-4 right-4 size-2 rounded-full bg-accent" />
      </div>
    </div>
  );
}

/** A thumbnail in a strip: half-faded unless the gallery shows them whole */
function Thumb({ slide, faded, children }: { slide: CareSlide; faded: boolean; children?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "relative h-(--thumb-h) w-(--thumb-w) shrink-0 overflow-hidden rounded-2xl bg-surface",
        faded && "opacity-50",
      )}
    >
      <Image
        src={slide.src}
        alt=""
        fill
        sizes="16rem"
        style={{ objectPosition: slide.position }}
        className="object-cover"
      />
      {children}
    </div>
  );
}
