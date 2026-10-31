"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";

/**
 * The hero's <section>, with its entrance animation and parallax depth:
 *   – Scroll: the live background drifts down behind everything and the headline sinks at its own
 *     pace, while the 3D stick keeps the page's speed — three layers at three depths.
 *   – Pointer (mouse only): headline and background ease a few pixels in opposite directions.
 */
export default function HeroMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Entrance: held (hidden) until the home intro and any page fade-in are done, so it's seen
        const entrance = gsap
          .timeline({ paused: true })
          .from("[data-hero-stick]", { y: 80, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.25)
          .from("[data-hero-strip] > *", { y: 16, opacity: 0, duration: 0.8, stagger: 0.08, ease: "power2.out" }, 0.6);
        const offEntrance = onIntroDone(() => entrance.play());

        // Scroll parallax, scrubbed across the hero leaving the viewport. Percent-based on the headline,
        // so it adds to (not fights) the pointer's pixel offsets below.
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true, // re-measure the hero height on resize
            },
          })
          .to("canvas", { y: () => (root.current?.offsetHeight ?? 0) * 0.4 }, 0)
          .to("h1", { yPercent: 70 }, 0);

        return offEntrance;
      });

      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        // A touch of overscan so the background's edges never show as it shifts
        gsap.set("canvas", { scale: 1.06 });
        const headX = gsap.quickTo("h1", "x", { duration: 1.2, ease: "power3.out" });
        const headY = gsap.quickTo("h1", "y", { duration: 1.2, ease: "power3.out" });
        const backX = gsap.quickTo("canvas", "x", { duration: 1.6, ease: "power3.out" });

        const onMove = (e: PointerEvent) => {
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          headX(nx * -22);
          headY(ny * -14);
          backX(nx * 18);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
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
