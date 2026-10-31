"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/**
 * The review cards' grid, with two kinds of motion:
 *   – data-scroll-speed="1.5" (large screens): while the grid scrolls through, the cards move at
 *     that multiple of the page's scroll, gliding over the pinned summary on a faster layer. They
 *     start and end flush with the section, so no empty band opens at its top or bottom. (Below lg
 *     the grid stacks, and a faster card would slide up over the summary.) The distance they end
 *     raised by is published as --reviews-travel, so the summary unpins where they end.
 *   – Each card's photo (data-review-media / data-review-image) fades in as it arrives, settling
 *     from a slight zoom; then its play chip (data-review-chip) fades up. Kept quiet on purpose.
 *     Reverses when scrolled back below, to replay.
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
          const travel = Math.max(0, ...speeds.map(travelFor));
          grid.style.marginBottom = `${-travel}px`;
          grid.style.setProperty("--reviews-travel", `${travel}px`);
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
          grid.style.removeProperty("--reviews-travel");
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
              // Jumped clean past it (fling, anchor link, reload mid-page): show it in place
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
            .from(media, { opacity: 0, duration: 0.9, ease: "power2.out" }, 0)
            .from(image, { scale: 1.06, duration: 1.4, ease: "power2.out" }, 0)
            .from(chip, { y: 6, opacity: 0, duration: 0.6, ease: "power2.out" }, 0.5);
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
