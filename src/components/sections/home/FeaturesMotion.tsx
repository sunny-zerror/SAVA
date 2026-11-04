"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The features section's <section>, with its entrance: as it scrolls in, the promises step in down
 * the list. The artwork on the right (disc, curved line, hand) stays still. Reverses when scrolled
 * back above, to replay.
 *
 * Hooks (data attributes in HomeFeatures): data-features-stage, data-features-item.
 */
export default function FeaturesMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-features-item]", {
          x: -48,
          opacity: 0,
          duration: 1.2,
          stagger: 0.12,
          ease: "expo.out",
          scrollTrigger: {
            trigger: "[data-features-stage]",
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
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
