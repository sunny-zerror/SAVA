"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The /home1 hero's <section>, pinned for a scrubbed scroll scene once its bottom reaches the bottom
 * of the screen (at once on large screens, where it's a screen tall):
 *   1. the copy beside the cabinet lifts away
 *   2. the hero stick leaves its shelf for the hand — CabinetTraveller follows `--stick-move`
 *      (0–1), tweened here on the section; the right door swings open to let it out (CabinetScene)
 *   3. the cabinet and its wall fade out to the white page behind them, while the hand rises
 *      into the middle of the screen to take the stick
 *   4. the stick's name and lines come in around it, held a moment before the pin lets go
 * With reduced motion nothing pins: the cabinet stays, and the hand isn't shown.
 */
export default function CabinetScroll({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(section, { "--stick-move": 0 });

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "bottom bottom",
              end: "+=220%",
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
          // 1. Copy away
          .to("[data-cabinet-copy]", { yPercent: -40, autoAlpha: 0, duration: 0.25, ease: "power1.in" }, 0)
          // 2. Stick off the shelf, to the middle and into the hand
          .to(section, { "--stick-move": 1, duration: 0.62, ease: "power2.inOut" }, 0.1)
          // 3. Room out to white while the stick is in the air, then the hand rises in under it
          .to("[data-cabinet-fade]", { autoAlpha: 0, duration: 0.3, ease: "power1.inOut" }, 0.12)
          .fromTo("[data-cabinet-end]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.14, ease: "power1.inOut" }, 0.36)
          .fromTo(
            "[data-cabinet-hand]",
            { yPercent: 30, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.36, ease: "power2.out" },
            0.38,
          )
          // 4. Its name and lines
          .fromTo(
            "[data-cabinet-outro]",
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.2, stagger: 0.05, ease: "power2.out" },
            0.7,
          )
          // Hold the finished frame a moment before the pin lets go
          .to({}, { duration: 0.25 });
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
