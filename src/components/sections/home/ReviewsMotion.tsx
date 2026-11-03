"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The review cards' grid, with two kinds of motion:
 *   – data-scroll-speed="1"–"2.5" (large screens; on each card): the card drifts at that multiple of
 *     the page's scroll as it passes through the viewport, centred on its place in the layout. (Below
 *     lg the grid stacks, and a faster card would slide up over the summary.)
 *   – Each card (data-review-card) makes an entrance as it arrives: the glass and the photo (with its
 *     play chip) stay still, while the stars, name and price, and thumbnail along its foot come in
 *     turn. Reverses when scrolled back below, to replay.
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
        // How much of each card's speed it really takes: the full drift has a 2.5× card cross the
        // screen in 40% of the time, leaving it sparse — at this share the speeds still read clearly
        // apart, and three or four cards stay in view
        const DRIFT = 0.45;

        // Each card drifts at its own speed s around its place in the layout: there as its middle
        // crosses the viewport's, (s − 1) × DRIFT × the scroll from that point off it either side — so it
        // arrives faster (or slower) and leaves the same way, while the layout's spacing holds at the
        // moment it's looked at. Timed by its own pass through the viewport, measured on its parent
        // (the card itself moves, and would shift its own trigger).
        cards.forEach((el) => {
          const speed = Math.max(1, Number(el.dataset.scrollSpeed) || 1);
          const parent = el.parentElement ?? grid;
          // Half the scroll the card takes to cross the viewport, top edge in to bottom edge out
          const half = () => ((window.innerHeight + el.offsetHeight) / 2) * DRIFT;
          gsap.fromTo(
            el,
            { y: () => (speed - 1) * half() },
            {
              y: () => -(speed - 1) * half(),
              ease: "none",
              scrollTrigger: {
                trigger: parent,
                // offsetTop: the lane is the card's offsetParent
                start: () => `top+=${el.offsetTop} bottom`,
                end: () => `top+=${el.offsetTop + el.offsetHeight} top`,
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
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

        // The card's entrance, along its foot only (the glass and photo stay put): the stars pop in one
        // by one, the name and price rise, and the stick thumbnail springs in with a twist. The card's
        // parent is what's watched: the card itself carries the scroll drift.
        gsap.utils.toArray<HTMLElement>("[data-review-card]").forEach((card) => {
          const watched = card.parentElement ?? card;
          const q = gsap.utils.selector(card);
          const tl = gsap
            .timeline({ paused: true, defaults: { ease: "expo.out" } })
            .from(
              q("[data-review-stars] > *"),
              { scale: 0, rotate: -45, duration: 0.6, stagger: 0.06, ease: "back.out(3)" },
              0,
            )
            .from(q("[data-review-info] > *"), { y: 16, opacity: 0, duration: 0.9, stagger: 0.08 }, 0.1)
            .from(
              q("[data-review-thumb]"),
              { scale: 0.5, rotate: -14, opacity: 0, duration: 0.9, ease: "back.out(2.2)" },
              0.2,
            );
          reveals.set(watched, tl);
          observer.observe(watched);
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
