"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

/**
 * The /home hero's <section>, pinned for a scrubbed scroll scene:
 *   1. the heading lifts away and the gym photo fades out to the white page behind it, its frame
 *      rails handing over to the light ones
 *   2. the stick leaves the bench for the centre slot — HeroStick follows `--stick-move` (0–1),
 *      tweened here on the section
 *   3. the column hairlines draw down, the kicker fades in, and the two story columns slide in from
 *      their sides while their lines rise out of masks
 * With reduced motion nothing pins or moves (the story sits below the photo; see NewHomeHero).
 */
export default function HeroScroll({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const [left, right] = ["left", "right"].map((side) =>
          SplitText.create(`[data-story-text="${side}"]`, { type: "lines", mask: "lines" }),
        );
        gsap.set(section, { "--stick-move": 0 });

        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=220%",
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
            },
          })
          // 1. Photo out
          .to("[data-hero-heading]", { yPercent: -12, opacity: 0, duration: 0.3, ease: "power1.in" }, 0)
          .to("[data-hero-photo]", { opacity: 0, duration: 0.45, ease: "power1.inOut" }, 0.1)
          // The page's light rails take over from the photo frame's as it fades, so the frame never breaks
          .to("[data-story-rail]", { opacity: 1, duration: 0.45, ease: "power1.inOut" }, 0.1)
          // 2. Stick to the centre
          .to(section, { "--stick-move": 1, duration: 0.5, ease: "power2.inOut" }, 0.2)
          // 3. Story in
          .fromTo(
            "[data-story-rule]",
            { opacity: 1, scaleY: 0 },
            { scaleY: 1, duration: 0.35, stagger: 0.05, ease: "power2.out" },
            0.5,
          )
          .to("[data-story-kicker]", { opacity: 1, duration: 0.15 }, 0.62)
          .fromTo(
            '[data-story-text="left"]',
            { opacity: 0, x: -80 },
            { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" },
            0.6,
          )
          .from(left.lines, { yPercent: 100, duration: 0.3, stagger: 0.04, ease: "power2.out" }, 0.62)
          .fromTo(
            '[data-story-text="right"]',
            { opacity: 0, x: 80 },
            { opacity: 1, x: 0, duration: 0.35, ease: "power2.out" },
            0.66,
          )
          .from(right.lines, { yPercent: 100, duration: 0.3, stagger: 0.04, ease: "power2.out" }, 0.68)
          // Hold the finished story a moment before the pin releases
          .to({}, { duration: 0.2 });

        return () => {
          left.revert();
          right.revert();
        };
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
