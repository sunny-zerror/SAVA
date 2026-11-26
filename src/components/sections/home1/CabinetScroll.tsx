"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The /home1 hero's <section>, pinned for a scrubbed scroll scene once its bottom reaches the bottom
 * of the screen (at once on large screens, where it's a screen tall):
 *   1. the copy beside the cabinet lifts away
 *   2. the hero stick leaves its shelf for the middle of the screen, turning once about its upright
 *      axis — CabinetTraveller follows `--stick-move` (0–1), tweened here on the section; the right
 *      door swings open to let it out (CabinetScene)
 *   3. while it's in the air the cabinet, its wall and the room's white fade away, down to the sky-blue
 *      gradient held behind the section (CabinetBackdrop)
 *   4. the heading to its left and the lines to its right fill in word by word, ghosted until then,
 *      held a moment before the pin lets go — then the bestsellers scroll up over the same blue
 * With reduced motion nothing pins: the cabinet stays, and the last frame isn't shown.
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
          // 2. Stick off the shelf, turning, to the middle
          .to(section, { "--stick-move": 1, duration: 0.62, ease: "power2.inOut" }, 0.1)
          // 3. The room gives way to the blue while the stick is in the air
          .to("[data-cabinet-fade]", { autoAlpha: 0, duration: 0.3, ease: "power1.inOut" }, 0.12)
          .to("[data-cabinet-room]", { autoAlpha: 0, duration: 0.28, ease: "power1.inOut" }, 0.22)
          .fromTo("[data-cabinet-end]", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, ease: "power1.inOut" }, 0.22)
          // 4. The heading, then the lines, word by word out of their ghosts
          .fromTo(
            "[data-cabinet-word]",
            { opacity: 0.12 },
            { opacity: 1, duration: 0.1, stagger: 0.012, ease: "power1.out" },
            0.55,
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
