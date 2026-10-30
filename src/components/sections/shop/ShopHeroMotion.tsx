"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The shop hero's <section>, with its text intro: the headline's lines rise (the global
 * data-heading-effect), then the eyebrow, the line of copy and the button rise and fade in after it
 * (data-shop-intro, in order). The sticks drop in on their own (ShopHeroModel).
 */
export default function ShopHeroMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-shop-intro]", {
          y: 24,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: "expo.out",
          delay: 0.45,
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
