"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The review cards' grid, with two kinds of motion:
 *   – data-scroll-speed="1.5" (large screens): while the grid scrolls through, the cards move at
 *     that multiple of the page's scroll, gliding past the static summary on a faster layer. They
 *     start and end flush with the section, so no empty band opens at its top or bottom. (Below lg
 *     the grid stacks, and a faster card would slide up over the summary.)
 *   – Each card's photo (data-review-media / data-review-image) opens out from a point at its
 *     centre, rounded, as the image settles from a zoom; then its play chip (data-review-chip)
 *     fades up. Reverses when scrolled back below, to replay.
 */
export default function ReviewsMotion({ children, ...props }: React.ComponentProps<"div">) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 64rem)", () => {
        const grid = root.current;
        if (!grid) return;
        const cards = gsap.utils.toArray<HTMLElement>("[data-scroll-speed]");
        const speeds = cards.map((el) => Math.max(1, Number(el.dataset.scrollSpeed) || 1));

        // The cards sit in place while the grid's top part (heading, summary) is in view. From the
        // grid's top reaching the viewport's top they run at `speed`, over just the scroll D that
        // brings their (raised) last row to the viewport's foot: H − vh = speed × D. They end raised
        // by travel = (speed − 1) × D, and the grid gives that much back below it, so neither the
        // top nor the bottom of the section is left with an empty band.
        const overflow = () => Math.max(0, grid.offsetHeight - window.innerHeight);
        const travelFor = (speed: number) => ((speed - 1) * overflow()) / speed;
        const takeUpSlack = () => {
          grid.style.marginBottom = `${-Math.max(0, ...speeds.map(travelFor))}px`;
        };
        takeUpSlack();
        ScrollTrigger.addEventListener("refreshInit", takeUpSlack);

        // Timed by the whole grid, not each card: cards with the same speed share one offset and
        // keep their layout spacing instead of spreading apart.
        cards.forEach((el, i) => {
          gsap.to(el, {
            y: () => -travelFor(speeds[i]),
            ease: "none",
            scrollTrigger: {
              trigger: grid,
              start: "top top",
              end: () => `+=${Math.max(1, overflow() / speeds[i])}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });
        });

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", takeUpSlack);
          grid.style.marginBottom = "";
        };
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Watched with an IntersectionObserver, not ScrollTrigger: it sees where the card really is,
        // scroll-speed offset included (ScrollTrigger measures once, wherever the drift had it then)
        const reveals = new Map<Element, gsap.core.Timeline>();
        const observer = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              const tl = reveals.get(entry.target);
              if (entry.isIntersecting) tl?.play();
              // Rewind when it drops back out below, so it replays on the way down
              else if (entry.boundingClientRect.top > 0) tl?.reverse();
              // Jumped clean past it (fling, anchor link, reload mid-page): show it open
              else tl?.progress(1);
            }
          },
          { rootMargin: "0px 0px -12% 0px" },
        );

        gsap.utils.toArray<HTMLElement>("[data-review-media]").forEach((media) => {
          const image = media.querySelector("[data-review-image]");
          const chip = media.querySelector("[data-review-chip]");
          const tl = gsap
            .timeline({ paused: true })
            .fromTo(
              media,
              { clipPath: "inset(50% 50% 50% 50% round 0.75rem)" },
              { clipPath: "inset(0% 0% 0% 0% round 0.75rem)", duration: 1.4, ease: "expo.inOut" },
              0,
            )
            .from(image, { scale: 1.5, duration: 1.9, ease: "expo.out" }, 0.15)
            .from(chip, { y: 12, opacity: 0, duration: 0.8, ease: "power3.out" }, 1);
          reveals.set(media, tl);
          observer.observe(media);
        });

        return () => observer.disconnect();
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} {...props}>
      {children}
    </div>
  );
}
