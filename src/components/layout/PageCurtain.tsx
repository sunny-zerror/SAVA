"use client";

import { useRef } from "react";
import Sparkle from "@/components/ui/Sparkle";
import { gsap, useGSAP } from "@/lib/gsap";
import { CURTAIN_COVER_MS, holdPageEnter, registerCurtain } from "@/lib/page-transition";

/** One per page change, in turn */
const TAGLINES = [
  "Own your movement",
  "Fresh from first move to last",
  "Clean ingredients, healthy skin",
  "Made for India’s heat",
  "Performance meets personal care",
];

/**
 * The page transition: a white curtain over the whole screen. template.tsx plays it as the old page
 * leaves — the browser holds the old page on screen while the curtain fades in over it — then one
 * of the taglines rises in as one line, holds, rises away, and the curtain fades off the new page.
 * The new page's entrance animations wait for that (holdPageEnter). A page change mid-curtain
 * restarts it from wherever it is, with the next tagline.
 *
 * Its own view-transition group above the page (site-chrome), so the page snapshots never cover it.
 */
export default function PageCurtain() {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const mark = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      const text = line.current;
      const star = mark.current;
      if (!el || !text || !star) return;

      let next = 0;
      let tl: gsap.core.Timeline | undefined;
      let release = () => {};

      const play = () => {
        tl?.kill();
        release();
        release = holdPageEnter();

        text.textContent = TAGLINES[next++ % TAGLINES.length];
        const cover = CURTAIN_COVER_MS / 1000;

        tl = gsap
          .timeline({ onComplete: () => void gsap.set(el, { pointerEvents: "none" }) })
          // From its current opacity: covering again mid-curtain doesn't flash
          .set(el, { pointerEvents: "auto" })
          .to(el, { autoAlpha: 1, duration: cover, ease: "power2.inOut" }, 0)
          .fromTo(
            star,
            { scale: 0, rotation: -90 },
            { scale: 1, rotation: 0, duration: 0.9, ease: "back.out(1.6)" },
            cover * 0.5,
          )
          // The line rises into its mask as one
          .fromTo(text, { yPercent: 110 }, { yPercent: 0, duration: 0.9, ease: "expo.out" }, cover * 0.5)
          // Out: up and away, then the curtain lifts off the new page
          .to(text, { yPercent: -110, duration: 0.5, ease: "power3.in" }, "+=0.35")
          .to(star, { scale: 0, rotation: 90, duration: 0.45, ease: "power3.in" }, "<")
          .add(() => release())
          .to(el, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" });
      };

      const unregister = gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => registerCurtain(play));
      return () => {
        unregister.revert();
        tl?.kill();
        release();
      };
    },
    { scope: root },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      // Hidden until played (autoAlpha); anchored above the page during transitions (globals.css)
      className="pointer-events-none invisible fixed inset-0 z-70 center flex-col gap-6 bg-paper px-gutter text-center opacity-0 [view-transition-class:site-chrome] [view-transition-name:page-curtain]"
    >
      <span ref={mark} className="block text-accent">
        <Sparkle className="size-6" />
      </span>
      {/* The line's mask: it bleeds below so descenders aren't cropped */}
      <p className="-mb-[0.12em] overflow-hidden pb-[0.12em] text-h3 text-ink">
        <span ref={line} className="block" />
      </p>
    </div>
  );
}
