"use client";

import { useEffect } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { onIntroDone } from "@/lib/intro";
import { afterPageEnter, pageEntering } from "@/lib/page-transition";

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
 *
 *   <div data-frame-rule> (FrameRule, src/components/ui/Frame.tsx)
 *     Its rail dots are always there; as it scrolls into view the line draws in between them, from
 *     both dots to meet in the middle, and draws back out when scrolled back above.
 *
 *   <span data-frame-rails> (inside Frame)
 *     The frame's two side borders draw down from its top as it scrolls into view, and back up when
 *     scrolled back above. Both kinds are left static inside a dialog (the menu drawer).
 *
 *   The motion system for everything else — one easing and rhythm site-wide, each playing once as
 *   it scrolls into view (hidden until then by globals.css, with the same 4s fallback):
 *     data-reveal            the element rises and fades in
 *     data-reveal="stagger"  its children do, one after another (lists, grids, link columns)
 *     data-reveal="fade"     opacity only (things that mustn't move: overlays, big type)
 *     data-reveal="image"    an image wrapper (overflow-hidden) opens upward from its foot while
 *                            the image inside settles from a slight zoom
 *   data-reveal-sequence     on a container: the reveals and headings inside it that are already in
 *                            view as the page comes in play one after another, in page order, rather
 *                            than all at once (a page's opening). Those further down still play as
 *                            they scroll in, with no wait.
 *   data-reveal-replay       on a container: its reveals replay — play on the way down, reverse
 *                            when scrolled back up past them (toggleActions "play none none reverse")
 *   data-parallax="0.1"      scroll depth: the element drifts against the scroll by that fraction
 *                            (an image inside an overflow-hidden wrapper; it's scaled to cover)
 */

export const HEADING_EFFECT = "data-heading-effect";

const HEADING_SELECTOR = `[${HEADING_EFFECT}]`;
const HEADING_REVEALED = `${HEADING_EFFECT}-revealed`;

/**
 * Runs `callback` once an intro heading (data-heading-effect="intro") has finished its reveal, so
 * heavy work — a 3D scene's setup — doesn't stutter it. Straight away if there's no heading or it's
 * already in; after `timeout` ms regardless (reduced motion, or the reveal never ran). Returns a cancel.
 */
export function afterHeadingReveal(heading: Element | null | undefined, callback: () => void, timeout = 4000) {
  let settled = false;
  const finish = (run: boolean) => {
    if (settled) return;
    settled = true;
    observer?.disconnect();
    window.clearTimeout(timer);
    if (run) callback();
  };
  if (!heading || heading.hasAttribute(HEADING_REVEALED)) {
    callback();
    return () => {};
  }
  const observer = new MutationObserver(() => heading.hasAttribute(HEADING_REVEALED) && finish(true));
  observer.observe(heading, { attributes: true, attributeFilter: [HEADING_REVEALED] });
  const timer = window.setTimeout(() => finish(true), timeout);
  return () => finish(false);
}
const LINE_SELECTOR = "[data-heading-line]";

/** Keeps descenders (g, y, p) from being cropped by the line masks */
const MASK_BLEED = { paddingBottom: "0.12em", marginBottom: "-0.12em" };

function reveal(heading: HTMLElement, lines: Element[]) {
  const motion = { yPercent: 110, duration: 1.1, stagger: 0.09, ease: "expo.out" };

  // data-heading-effect="intro": held until the home intro clears (src/lib/intro.ts). Marked once
  // it's in, for what should wait on it (afterHeadingReveal)
  if (heading.getAttribute(HEADING_EFFECT) === "intro") {
    const tween = gsap.from(lines, {
      ...motion,
      duration: 1.3,
      paused: true,
      onComplete: () => heading.setAttribute(HEADING_REVEALED, ""),
    });
    onIntroDone(() => tween.play());
    return tween;
  }

  return gsap.from(lines, {
    ...motion,
    // Its turn in a sequenced opening (data-reveal-sequence)
    delay: sequenceDelay(heading),
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

/**
 * The frame's borders: drawn in as their part of the page scrolls into view, drawn back out above.
 * Revealed with clip-path, not scaled: a transformed 1px line on a fractional pixel gets resampled
 * across two rows and reads thick and soft; a clipped one stays a crisp hairline.
 */
const DRAW = { duration: 1.2, ease: "expo.inOut" };
const drawOn = (trigger: Element) => ({ trigger, start: "top 92%", toggleActions: "play none none reverse" });

/** A fixed panel has no scroll position to trigger on; a loading placeholder (aria-busy) is gone
 *  before a draw-in would finish — the real content's borders draw instead */
const staysStatic = (el: Element) => !!el.closest("[role=dialog], [aria-busy=true]");

function animateFrameRule(rule: HTMLElement) {
  if (!staysStatic(rule)) {
    // The dots are there from the start; the line draws in between them, from both ends to meet in
    // the middle — each half opens out from its dot
    gsap.from(rule.querySelectorAll("[data-frame-line]"), {
      clipPath: (i: number) => (i === 0 ? "inset(0% 100% 0% 0%)" : "inset(0% 0% 0% 100%)"),
      ...DRAW,
      scrollTrigger: drawOn(rule),
    });
  }
  rule.setAttribute("data-frame-rule-ready", "");
}

function animateFrameRails(rails: HTMLElement) {
  if (!staysStatic(rails)) {
    // Both rails draw down from the frame's top as it comes into view
    gsap.from(rails.querySelectorAll("[data-frame-rail]"), {
      clipPath: "inset(0% 0% 100% 0%)",
      ...DRAW,
      duration: 1.6,
      scrollTrigger: drawOn(rails),
    });
  }
  rails.setAttribute("data-frame-rails-ready", "");
}

/** The site's entrance motion: one ease and rhythm everywhere */
const ENTER = { duration: 1.1, ease: "expo.out" };
/**
 * Plays once, as the element's top passes 88% of the viewport — or, inside [data-reveal-replay],
 * plays each time it comes in from below and reverses as it's scrolled back down out of view
 */
const onEnter = (trigger: Element) =>
  trigger.closest("[data-reveal-replay]")
    ? { trigger, start: "top 88%", toggleActions: "play none none reverse" }
    : { trigger, start: "top 88%", once: true };

/** Gap between the steps of a data-reveal-sequence opening */
const SEQUENCE_STEP = 0.12;
const SEQUENCED = `[data-reveal], ${HEADING_SELECTOR}`;
/** In view as the page comes in — where onEnter would fire straight away */
const inViewNow = (el: Element) => {
  const { top, height } = el.getBoundingClientRect();
  return height > 0 && top < window.innerHeight * 0.88;
};

/**
 * The wait before an element's entrance inside a data-reveal-sequence: its place among the
 * sequence's members already in view, one step apart. Nothing for those below the fold, which
 * play as they scroll in.
 */
function sequenceDelay(el: Element) {
  const sequence = el.closest("[data-reveal-sequence]");
  if (!sequence || !inViewNow(el)) return 0;
  const members = Array.from(sequence.querySelectorAll(SEQUENCED)).filter(inViewNow);
  return Math.max(0, members.indexOf(el)) * SEQUENCE_STEP;
}

function animateReveal(el: HTMLElement) {
  const ready = () => el.setAttribute("data-reveal-ready", "");
  const kind = el.dataset.reveal;
  // Its turn in a sequenced opening (data-reveal-sequence); 0 everywhere else
  const delay = sequenceDelay(el);

  if (kind === "image") {
    const image = el.querySelector("img, canvas, video");
    gsap
      .timeline({ scrollTrigger: onEnter(el), delay })
      .from(el, { clipPath: "inset(100% 0% 0% 0%)", duration: 1.3, ease: "expo.out" })
      .from(image, { scale: 1.06, duration: 1.6, ease: "expo.out" }, 0);
  } else if (kind === "stagger") {
    gsap.from(el.children, { ...ENTER, y: 32, opacity: 0, stagger: 0.08, delay, scrollTrigger: onEnter(el) });
  } else if (kind === "fade") {
    gsap.from(el, { ...ENTER, duration: 1.4, opacity: 0, delay, scrollTrigger: onEnter(el) });
  } else {
    gsap.from(el, { ...ENTER, y: 32, opacity: 0, delay, scrollTrigger: onEnter(el) });
  }
  ready();
}

function animateParallax(el: HTMLElement) {
  const depth = Number(el.dataset.parallax) || 0.1;
  // Scaled up just enough that the drift never shows an edge inside its wrapper
  gsap.set(el, { scale: 1 + depth * 2 });
  gsap.fromTo(
    el,
    { yPercent: -depth * 80 },
    {
      yPercent: depth * 80,
      ease: "none",
      scrollTrigger: { trigger: el.parentElement ?? el, start: "top bottom", end: "bottom top", scrub: true },
    },
  );
}

/** Data-attribute effects, scanned for across the page */
const EFFECTS: [selector: string, animate: (el: HTMLElement) => void | (() => void)][] = [
  [HEADING_SELECTOR, animateHeading],
  ["[data-frame-rule]", animateFrameRule],
  ["[data-frame-rails]", animateFrameRails],
  ["[data-reveal]", animateReveal],
  ["[data-parallax]", animateParallax],
];

export function useGlobalAnimations() {
  // Set up once, not per route: a page's elements are reverted as they leave (scan, below) and new
  // ones picked up as they arrive. Tearing down per route raced the page fade — React holds effect
  // cleanups until a view transition ends, so the old route's scan would animate the new page's
  // headings, then its teardown reset them for the new route's scan to replay.
  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", (context) => {
      // Each element's effect gets its own context (recorded by this one, so it reverts with the
      // route), letting it be reverted alone when its element leaves the page mid-route
      const live = new Map<Element, ReturnType<typeof gsap.context>>();
      let frame = 0;
      let retry = 0;
      let retries = 0;
      let disposed = false;
      let cancelEnterWait: (() => void) | null = null;

      const scan = () => {
        // A queued frame or retry can outlive teardown; and a retry can run while a frame is queued
        if (disposed) return;
        cancelAnimationFrame(frame);
        frame = 0;
        // A new page still fading in (page transition): set up once it's fully in, so its entrances
        // are seen — and their setup doesn't stutter the fade
        if (pageEntering()) {
          cancelEnterWait ??= afterPageEnter(() => {
            cancelEnterWait = null;
            scan();
          });
          return;
        }
        live.forEach((ctx, el) => {
          if (el.isConnected) return;
          ctx.revert();
          live.delete(el);
        });

        let waiting = false;
        for (const [selector, animate] of EFFECTS) {
          document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
            if (live.has(el)) return;
            // Streamed-in HTML is in the DOM before React hydrates it; changing it then would make
            // the hydration mismatch. Leave it until React has claimed it.
            if (!isHydrated(el)) {
              waiting = true;
              return;
            }
            context.add(() => {
              live.set(
                el,
                gsap.context(() => animate(el)),
              );
            });
          });
        }
        // Hydration doesn't change the DOM, so the observer below won't fire for it: poll — quickly
        // at first, then slowly, so late hydration (a busy main thread) is still picked up
        window.clearTimeout(retry);
        if (waiting) retry = window.setTimeout(scan, retries++ < 50 ? 60 : 500);
      };

      scan();

      // Content that streams in later (Suspense boundaries, client-rendered views), or leaves
      const observer = new MutationObserver(() => {
        retries = 0;
        frame ||= requestAnimationFrame(scan);
      });
      observer.observe(document.body, { childList: true, subtree: true });

      return () => {
        disposed = true;
        cancelEnterWait?.();
        observer.disconnect();
        cancelAnimationFrame(frame);
        window.clearTimeout(retry);
      };
    });

    return () => mm.revert();
  }, []);
}

/** Mount once near the root to enable the data-attribute animations above */
export function GlobalAnimations() {
  useGlobalAnimations();
  return null;
}
