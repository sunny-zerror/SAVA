"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** How fast each card drifts against the scroll, in turn — so they pass the heading at different depths */
const DEPTHS = [1, 1.4, 0.75, 1.25, 1.1];

/**
 * Testimonials' <section>. Each card ([data-story]) is scrubbed by its own pass through the screen:
 *   – it drifts up against the scroll at its own depth (DEPTHS), so the cards layer like a parallax
 *   – coming in, it swings upright from its side (data-flip: the right), its photo wiping open from
 *     the foot while the picture inside settles from a zoom, and the quote card lands a beat later
 *     with a little overshoot
 *   – going out over the top, it tips the other way and draws back, the quote racing ahead
 * Hovering a card lifts its quote and leans the photo in. Reduced motion: the cards just sit in place.
 */
export default function TestimonialsMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-story]", root.current);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        cards.forEach((card, i) => {
          const photo = card.querySelector("[data-story-photo]");
          const picture = card.querySelector("[data-story-picture]");
          const quote = card.querySelector("[data-story-quote]");
          // -1 swings in from the left, 1 from the right
          const side = card.hasAttribute("data-flip") ? 1 : -1;
          const depth = DEPTHS[i % DEPTHS.length] ?? 1;
          // Less drift on phones, where the cards stack in one column
          const drift = () => depth * (window.innerWidth < 768 ? 40 : 120);

          gsap
            .timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            })
            // The whole pass: drifting up at its depth
            .fromTo(card, { y: drift }, { y: () => -drift(), duration: 1 }, 0)
            // In: swinging upright from its side, the photo wiping open over a settling zoom
            .fromTo(
              card,
              { rotation: side * 7, xPercent: side * 12, transformOrigin: side > 0 ? "100% 100%" : "0% 100%" },
              { rotation: 0, xPercent: 0, duration: 0.42, ease: "power3.out" },
              0,
            )
            .fromTo(
              photo,
              { clipPath: "inset(100% 0% 0% 0% round 1rem)" },
              { clipPath: "inset(0% 0% 0% 0% round 1rem)", duration: 0.38, ease: "power3.out" },
              0.02,
            )
            .fromTo(picture, { scale: 1.35 }, { scale: 1, duration: 0.45, ease: "power2.out" }, 0.02)
            // The quote lands a beat later, overshooting a touch
            .fromTo(
              quote,
              { opacity: 0, xPercent: side * -30, yPercent: 40, rotation: side * -9 },
              { opacity: 1, xPercent: 0, yPercent: 0, rotation: 0, duration: 0.32, ease: "back.out(1.8)" },
              0.14,
            )
            // Out: tipping the other way and drawing back, the quote racing ahead
            .to(card, { rotation: side * -4, scale: 0.9, opacity: 0.35, duration: 0.3, ease: "power2.in" }, 0.7)
            .to(picture, { scale: 1.15, duration: 0.3, ease: "power2.in" }, 0.7)
            .to(quote, { yPercent: -45, duration: 0.3, ease: "power2.in" }, 0.7);
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} {...props}>
      {children}
    </section>
  );
}
