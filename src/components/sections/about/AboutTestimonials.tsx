"use client";

import { RiArrowLeftLine, RiArrowRightLine, RiDoubleQuotesR, RiPlayFill, RiStarFill } from "@remixicon/react";
import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Frame, FrameRule } from "@/components/ui/Frame";
import SectionHeading from "@/components/ui/SectionHeading";
import { cn } from "@/utils/cn";

// Dummy reviews and stand-in photos until the real ones are in
const testimonials = [
  {
    name: "Janna Sims",
    role: "Designer",
    city: "Mumbai",
    country: "IN",
    image: "/images/home/review-3.png",
    duration: "2.19",
    quote:
      "Effective sweat control with a lightweight feel and refined fragrance. SAVA has become my everyday essential.",
  },
  {
    name: "Jeromy Ellison",
    role: "Personal Trainer",
    city: "Delhi",
    country: "IN",
    image: "/images/about/gym_img.png",
    duration: "1.48",
    quote: "Two sessions a day and it still holds up. It's the first antiperspirant I haven't had to reapply at lunch.",
  },
  {
    name: "Mira Kapoor",
    role: "Swim Coach",
    city: "Chennai",
    country: "IN",
    image: "/images/about/confidence_img_3.png",
    duration: "2.05",
    quote: "Humid pool deck, long days — and I stay dry and fresh. The Forest Air scent is subtle in the best way.",
  },
  {
    name: "Alexandra Chase",
    role: "Product Manager",
    city: "Bengaluru",
    country: "IN",
    image: "/images/home/review-1.png",
    duration: "1.32",
    quote:
      "Back-to-back meetings in a Bengaluru summer used to mean sweat patches. Not any more. Clean, calm, confident.",
  },
  {
    name: "Ananya Rao",
    role: "Runner",
    city: "Pune",
    country: "IN",
    image: "/images/about/confidence_img_1.png",
    duration: "1.17",
    quote:
      "My 7am run is done before the city wakes up, and I'm still fresh at my desk by ten. Gentle on my skin, too.",
  },
  {
    name: "Kabir Shah",
    role: "Architect",
    city: "Ahmedabad",
    country: "IN",
    image: "/images/products/shared/sava-very-local.png",
    duration: "2.40",
    quote: "No white marks, no sticky feel, no overpowering smell. It just works — which is exactly what I wanted.",
  },
];

const AUTOPLAY_MS = 5000;

/*
 * Where each card sits, by its place relative to the open one (0), as % of the track's width: the open
 * card wide, the one before it tall, the rest short, fading out at the track's edges. Cards further
 * off wait hidden beyond the edges, so wrapping round the loop is never seen.
 */
type Slot = { left: number; width: number; tall: boolean; shown: boolean };
const DESKTOP: Record<number, Slot> = {
  [-2]: { left: -2.4, width: 17, tall: false, shown: true },
  [-1]: { left: 15.8, width: 22, tall: true, shown: true },
  0: { left: 39, width: 38, tall: true, shown: true },
  1: { left: 78.2, width: 17, tall: false, shown: true },
  2: { left: 96.4, width: 17, tall: false, shown: true },
};
const MOBILE: Record<number, Slot> = {
  [-1]: { left: -73, width: 80, tall: true, shown: true },
  0: { left: 10, width: 80, tall: true, shown: true },
  1: { left: 93, width: 80, tall: true, shown: true },
};
const hiddenSlot = (offset: number, slots: Record<number, Slot>): Slot => {
  const keys = Object.keys(slots).map(Number);
  const edge = offset < 0 ? slots[Math.min(...keys)] : slots[Math.max(...keys)];
  return { ...edge, left: edge.left + (offset < 0 ? -edge.width : edge.width), shown: false };
};

const desktopQuery = "(min-width: 48rem)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(desktopQuery);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/** The shortest way round the loop from `active` to `index`: −n … +n */
const offsetOf = (index: number, active: number, count: number) => {
  let offset = (index - active) % count;
  if (offset > count / 2) offset -= count;
  if (offset < -count / 2) offset += count;
  return offset;
};

/**
 * Customer stories in an endless carousel: the open one a deep-blue card with the quote, the others
 * photos. Arrows, a tap on a card, or the autoplay (paused while pointed at or focused, off for
 * reduced motion) move it on; every card glides and resizes into its new place at once.
 */
export default function AboutTestimonials() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const desktop = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(desktopQuery).matches,
    () => true,
  );
  const slots = desktop ? DESKTOP : MOBILE;
  const count = testimonials.length;
  const step = (by: number) => setActive((i) => (i + by + count) % count);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  const current = testimonials[active];

  return (
    <section aria-labelledby="about-testimonials" data-reveal-replay>
      <Frame className="pb-section">
        <SectionHeading
          id="about-testimonials"
          eyebrow="Our Testimonial"
          title={
            <>
              Clients Say About Our
              <br />
              Products
            </>
          }
          className="px-inset py-10"
        />
        <FrameRule />

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer testimonials"
          className="flex flex-col items-center gap-8 pt-10"
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <p aria-live="polite" className="sr-only">
            Testimonial {active + 1} of {count}: {current.name}
          </p>
          {/* The edges fade out, so the cards there read as coming and going */}
          <div data-reveal="fade" className="relative h-[28rem] w-full overflow-hidden mask-x-from-90% md:h-[30rem]">
            {testimonials.map((t, i) => {
              const offset = offsetOf(i, active, count);
              const slot = slots[offset] ?? hiddenSlot(offset, slots);
              const open = offset === 0;
              return (
                <article
                  key={t.name}
                  aria-hidden={!open || undefined}
                  onClick={() => !open && setActive(i)}
                  style={{ left: `${slot.left}%`, width: `${slot.width}%` }}
                  className={cn(
                    "absolute top-0 isolate overflow-hidden rounded-2xl bg-navy text-paper",
                    "transition-[left,width,height,opacity] duration-900 ease-out-expo",
                    slot.tall ? "h-full" : "h-1/2",
                    slot.shown ? "opacity-100" : "opacity-0",
                    !open && "cursor-pointer",
                  )}
                >
                  {/* The photo, with a scrim for the name — fades out as the card opens */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700",
                      open ? "opacity-0" : "opacity-100",
                    )}
                  >
                    <Image
                      src={t.image}
                      alt=""
                      fill
                      sizes="(min-width: 48rem) 22vw, 80vw"
                      className={cn(
                        "object-cover transition-transform duration-900 ease-out-expo",
                        open ? "scale-110" : "scale-100",
                      )}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
                    <span className="absolute top-4 right-4 flex items-center gap-2 text-caption font-medium tabular-nums">
                      {t.duration}
                      <span className="center size-7 rounded-full bg-paper text-ink">
                        <RiPlayFill className="size-3" />
                      </span>
                    </span>
                    <div className="absolute inset-x-4 bottom-4 flex flex-col">
                      <span className="text-h6">{t.name}</span>
                      <span className="text-caption text-paper/80">
                        {t.city}, {t.country}
                      </span>
                    </div>
                  </div>

                  {/* The open card: deep blue, the light pooling up from the lower right, and the review */}
                  <div
                    className={cn(
                      "absolute inset-0 flex flex-col justify-between p-5 transition-opacity duration-700 md:p-6",
                      open ? "opacity-100 delay-200" : "pointer-events-none opacity-0",
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 -z-10 bg-radial-[at_90%_100%] from-accent via-accent/45 to-navy to-75%"
                    />
                    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-20 mix-blend-overlay" />

                    <div className="flex items-start justify-between gap-4">
                      <dl className="flex gap-6">
                        <div className="flex flex-col border-r border-paper/20 pr-6">
                          <dt className="text-h6">{t.name}</dt>
                          <dd className="text-caption text-paper/80">{t.role}</dd>
                        </div>
                        <div className="flex flex-col">
                          <dt className="text-h6">{t.city}</dt>
                          <dd className="text-caption text-paper/80">{t.country}</dd>
                        </div>
                      </dl>
                      <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-paper/10">
                        <Image src={t.image} alt="" fill sizes="3.5rem" className="object-cover" />
                      </span>
                    </div>

                    {/* The review rises in once the card has opened */}
                    <div
                      className={cn(
                        "flex items-end justify-between gap-6 transition-[opacity,translate] duration-700 ease-out-expo",
                        open ? "translate-y-0 opacity-100 delay-300" : "translate-y-4 opacity-0",
                      )}
                    >
                      <div className="flex max-w-md flex-col gap-3">
                        <span role="img" aria-label="Rated 5 out of 5" className="flex gap-0.5 text-star">
                          {Array.from({ length: 5 }, (_, s) => (
                            <RiStarFill key={s} aria-hidden="true" className="size-3.5" />
                          ))}
                        </span>
                        <blockquote className="text-body">&ldquo;{t.quote}&rdquo;</blockquote>
                      </div>
                      <RiDoubleQuotesR aria-hidden="true" className="size-8 shrink-0" />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div data-reveal className="flex gap-2">
            {[
              { label: "Previous testimonial", by: -1, Icon: RiArrowLeftLine },
              { label: "Next testimonial", by: 1, Icon: RiArrowRightLine },
            ].map(({ label, by, Icon }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                onClick={() => step(by)}
                // As the other carousels' arrows: plain outlines that fill with SAVA blue on hover
                className="center size-10 rounded-full border border-line bg-paper text-muted transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-paper"
              >
                <Icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
      </Frame>
    </section>
  );
}
