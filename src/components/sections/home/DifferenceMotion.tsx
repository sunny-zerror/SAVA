"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The comparison section's <section>, with its entrance: column headings rise and the two products
 * pop in, a soft blue fill runs down the SAVA column, then row by row the icon badge spins in, the
 * label slides across and both values rise. Reverses when scrolled back above, to replay.
 *
 * Hooks (data attributes in HomeDifference): data-diff-table, data-diff-head, data-diff-product,
 * data-diff-fill (the SAVA column's cell backgrounds, top to bottom), data-diff-row, and inside each
 * row data-diff-badge, data-diff-point, data-diff-value. Content is animated, not the table cells.
 */
export default function DifferenceMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: "[data-diff-table]", start: "top 75%", toggleActions: "play none none reverse" },
        });

        tl.from("[data-diff-head]", { y: 30, opacity: 0, duration: 1, stagger: 0.1 }, 0)
          .from(
            "[data-diff-product]",
            { scale: 0.5, rotation: -10, opacity: 0, duration: 0.9, stagger: 0.12, ease: "back.out(1.8)" },
            0.15,
          )
          // One continuous column of light: each cell's fill picks up where the one above ended
          .from(
            "[data-diff-fill]",
            { scaleY: 0, transformOrigin: "50% 0%", duration: 0.35, stagger: 0.3, ease: "none" },
            0.3,
          );

        gsap.utils.toArray<HTMLElement>("[data-diff-row]").forEach((row, i) => {
          const at = 0.45 + i * 0.3;
          tl.from(
            row.querySelector("[data-diff-badge]"),
            { scale: 0, rotation: -120, duration: 0.9, ease: "back.out(1.7)" },
            at,
          )
            .from(row.querySelector("[data-diff-point]"), { x: -36, opacity: 0, duration: 1 }, at + 0.05)
            .from(
              row.querySelectorAll("[data-diff-value]"),
              { y: 20, opacity: 0, duration: 1, stagger: 0.1 },
              at + 0.1,
            );
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
