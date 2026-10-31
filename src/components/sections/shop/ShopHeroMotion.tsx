"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";

/**
 * The shop hero's <section>, with its text intro: the headline's lines rise (the global
 * data-heading-effect), then the eyebrow, the line of copy and the button rise and fade in after it
 * (data-shop-intro, in order).
 */
export default function ShopHeroMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        // Held (hidden) until any page fade-in is done, alongside the headline's reveal, so it's seen
        const entrance = gsap.from("[data-shop-intro]", {
          y: 24,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: "expo.out",
          delay: 0.45,
          paused: true,
        });
        return onIntroDone(() => entrance.play());
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
