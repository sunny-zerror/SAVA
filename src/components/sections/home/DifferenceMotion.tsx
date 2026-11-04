"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The comparison section's <section>, with its entrance: row by row, the icon badges in the
 * Comparison Point column spin in. Everything else in the table is static. Reverses when scrolled
 * back above, to replay.
 *
 * Hooks (data attributes in HomeDifference): data-diff-table, data-diff-badge (one per row, in order).
 */
export default function DifferenceMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-diff-badge]", {
          scale: 0,
          rotation: -120,
          duration: 0.9,
          stagger: 0.25,
          ease: "back.out(1.7)",
          scrollTrigger: { trigger: "[data-diff-table]", start: "top 75%", toggleActions: "play none none reverse" },
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
