"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The features section's <section>, with its entrance: as it scrolls in, the blue disc swells up,
 * the curved line rolls a quarter turn along its circle into place, the hand slides in from the
 * wrist, and the promises step in down the list. Afterwards the curved line keeps orbiting slowly
 * behind the hand. Reverses when scrolled back above, to replay.
 *
 * Hooks (data attributes in HomeFeatures): data-features-stage, data-features-ring, data-features-disc,
 * data-features-text (the <textPath>), data-features-hand (each full-size hand layer), data-features-item.
 */
export default function FeaturesMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const text = root.current?.querySelector("[data-features-text]");

        // Slow orbit once it has landed: 0% → 50% of the doubled path is one full turn
        const orbit = gsap.fromTo(
          text ?? [],
          { attr: { startOffset: "0%" } },
          { attr: { startOffset: "50%" }, duration: 70, ease: "none", repeat: -1, paused: true },
        );

        gsap
          .timeline({
            defaults: { ease: "expo.out" },
            scrollTrigger: {
              trigger: "[data-features-stage]",
              start: "top 75%",
              toggleActions: "play none none reverse",
              onLeaveBack: () => orbit.pause(),
            },
            onComplete: () => {
              orbit.play(0);
            },
          })
          .from("[data-features-ring]", { scale: 0.85, opacity: 0, duration: 1.6 }, 0)
          .from("[data-features-disc]", { scale: 0.55, opacity: 0, duration: 1.6, svgOrigin: "795 663.3" }, 0)
          // Rolls in along the circle: from a quarter turn back (25%) to its resting place (50%)
          .fromTo(
            text ?? [],
            { attr: { startOffset: "25%" } },
            { attr: { startOffset: "50%" }, duration: 2.2, ease: "expo.out" },
            0.15,
          )
          // (faded on its <text>: opacity doesn't reliably apply to a <textPath>)
          .from(text?.parentElement ?? [], { opacity: 0, duration: 1.4, ease: "power2.out" }, 0.15)
          // The hand swings in from the wrist. Its layers all fill the stage, so they share one origin and move as one
          .from(
            "[data-features-hand]",
            { xPercent: 12, rotation: 5, opacity: 0, duration: 1.6, transformOrigin: "100% 100%" },
            0.2,
          )
          .from("[data-features-item]", { x: -48, opacity: 0, duration: 1.2, stagger: 0.12 }, 0.3);
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
