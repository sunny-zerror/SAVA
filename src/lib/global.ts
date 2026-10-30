"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";

/*
 * Site-wide animations driven by data attributes, so Server Components can opt in without
 * shipping their own client wrapper. Mounted once by <GlobalAnimations /> in AppProviders.
 *
 *   <h1 data-heading-effect>…</h1>
 *     Line-by-line reveal: SplitText cuts the heading into lines, each wrapped in an
 *     overflow-hidden mask, and the lines rise in on the y axis when the heading scrolls into view
 *     (and drop back out when it's scrolled back below the fold, so it replays).
 *
 *   <h1 data-heading-effect><span data-heading-line>…</span><span data-heading-line>…</span></h1>
 *     Same reveal on hand-made lines — use it when the lines carry their own styling that
 *     SplitText would break (e.g. background-clip: text gradients).
 *
 *   data-heading-effect="intro" waits for the home intro to clear instead of the scroll position.
 */

export const HEADING_EFFECT = "data-heading-effect";

const HEADING_SELECTOR = `[${HEADING_EFFECT}]`;
const LINE_SELECTOR = "[data-heading-line]";

/** Keeps descenders (g, y, p) from being cropped by the line masks */
const MASK_BLEED = { paddingBottom: "0.12em", marginBottom: "-0.12em" };

function reveal(heading: HTMLElement, lines: Element[]) {
  const motion = { yPercent: 110, duration: 1.1, stagger: 0.09, ease: "expo.out" };

  // data-heading-effect="intro": held until the home intro clears (src/lib/intro.ts)
  if (heading.getAttribute(HEADING_EFFECT) === "intro") {
    const tween = gsap.from(lines, { ...motion, duration: 1.3, paused: true });
    onIntroDone(() => tween.play());
    return tween;
  }

  return gsap.from(lines, {
    ...motion,
    // Plays on the way down; scrolling back up past the start hides the lines again for a replay
    scrollTrigger: { trigger: heading, start: "top 90%", toggleActions: "play none none reverse" },
  });
}

function showHeading(heading: HTMLElement) {
  heading.setAttribute(`${HEADING_EFFECT}-ready`, "");
}

/** Wraps each hand-made line in a mask; returns a cleanup that unwraps them */
function revealManualLines(heading: HTMLElement, lines: HTMLElement[]) {
  const masks = lines.map((line) => {
    const mask = document.createElement("span");
    mask.style.display = "block";
    mask.style.overflow = "hidden";
    Object.assign(mask.style, MASK_BLEED);
    line.replaceWith(mask);
    mask.appendChild(line);
    return mask;
  });

  reveal(heading, lines);
  showHeading(heading);

  return () => masks.forEach((mask) => mask.replaceWith(...mask.childNodes));
}

function revealSplitLines(heading: HTMLElement) {
  SplitText.create(heading, {
    type: "lines",
    mask: "lines",
    linesClass: "heading-line",
    // Re-splits after fonts load / on resize, keeping the reveal's progress
    autoSplit: true,
    onSplit(self) {
      self.masks.forEach((mask) => {
        (mask as HTMLElement).style.overflow = "hidden";
        Object.assign((mask as HTMLElement).style, MASK_BLEED);
      });
      showHeading(heading);
      return reveal(heading, self.lines);
    },
  });
}

/** Whether React has hydrated this element (it tags the DOM nodes it owns with its fiber) */
const isHydrated = (el: Element) => Object.keys(el).some((key) => key.startsWith("__reactFiber$"));

function animateHeading(heading: HTMLElement) {
  const lines = Array.from(heading.querySelectorAll<HTMLElement>(LINE_SELECTOR));
  return lines.length ? revealManualLines(heading, lines) : revealSplitLines(heading);
}

export function useGlobalAnimations() {
  const pathname = usePathname();

  // Re-run per route: the old page's headings are gone, and streamed content keeps arriving
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", (context) => {
      const seen = new WeakSet<Element>();
      let frame = 0;
      let retry = 0;
      let retries = 0;

      const scan = () => {
        frame = 0;
        let waiting = false;
        document.querySelectorAll<HTMLElement>(HEADING_SELECTOR).forEach((heading) => {
          if (seen.has(heading)) return;
          // Streamed-in HTML is in the DOM before React hydrates it; splitting it then would make
          // the hydration mismatch. Leave it until React has claimed it.
          if (!isHydrated(heading)) {
            waiting = true;
            return;
          }
          seen.add(heading);
          context.add(() => animateHeading(heading));
        });
        // Hydration doesn't change the DOM, so the observer below won't fire for it: poll briefly
        window.clearTimeout(retry);
        if (waiting && retries++ < 50) retry = window.setTimeout(scan, 60);
      };

      scan();

      // Headings that stream in later (Suspense boundaries, client-rendered views)
      const observer = new MutationObserver(() => {
        frame ||= requestAnimationFrame(scan);
      });
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        cancelAnimationFrame(frame);
        window.clearTimeout(retry);
      };
    });

    return () => mm.revert();
  }, [pathname]);
}

/** Mount once near the root to enable the data-attribute animations above */
export function GlobalAnimations() {
  useGlobalAnimations();
  return null;
}
