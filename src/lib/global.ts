"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
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
 *     The rule draws out from its centre as it scrolls into view, then its rail dots pop in with a
 *     ripple. Replays like the headings. Rules inside a dialog (the menu drawer) are left static.
 *
 *   <span data-frame-rails> (inside Frame)
 *     While the frame is in view, every few seconds a pulse of light runs down both rails. Each
 *     drawn rule it passes lights up: the dots flare and ripple, and a spark runs in along the rule
 *     from each rail to meet in the middle. Not tied to the scroll — it runs on its own.
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

/** Rail pulses: how fast one runs down the rails, and the pause before the next while in view */
const PULSE_SPEED = 900; // px per second
const PULSE_GAP: [number, number] = [5, 9]; // seconds, picked at random so frames fall out of step

/** Each rule's draw-in, so a pulse only lights up rules that are already drawn */
const ruleDraws = new WeakMap<Element, gsap.core.Timeline>();

/** A ring spreads out from each of the rule's dots and fades */
function ripple(rule: Element) {
  return gsap.fromTo(
    rule.querySelectorAll("[data-frame-ring]"),
    { scale: 1, opacity: 0.8 },
    { scale: 4, opacity: 0, duration: 1, ease: "power2.out", immediateRender: false },
  );
}

function animateFrameRule(rule: HTMLElement) {
  const ready = () => rule.setAttribute("data-frame-rule-ready", "");
  // A fixed panel has no scroll position to trigger on
  if (rule.closest("[role=dialog]")) return ready();

  const draw = gsap
    .timeline({ scrollTrigger: { trigger: rule, start: "top 92%", toggleActions: "play none none reverse" } })
    .from(rule.querySelector("[data-frame-line]"), { scaleX: 0, duration: 1.4, ease: "expo.inOut" })
    .from(rule.querySelectorAll("[data-frame-dot]"), { scale: 0, duration: 0.6, ease: "back.out(3)" }, 0.9)
    .add(ripple(rule), 1);
  ruleDraws.set(rule, draw);
  ready();
}

/** A pulse passing through a rule: its dots flare, and a spark runs in from each rail to meet mid-rule */
function flare(rule: HTMLElement) {
  const width = rule.offsetWidth;
  const tl = gsap
    .timeline()
    .to(rule.querySelectorAll("[data-frame-dot]"), { scale: 1.8, duration: 0.2, yoyo: true, repeat: 1 }, 0)
    .add(ripple(rule), 0);
  rule.querySelectorAll<HTMLElement>("[data-frame-spark]").forEach((spark, i) => {
    const length = spark.offsetWidth;
    // Leading edges meet in the middle: the first comes in from the left, the second from the right
    const [from, to] = i === 0 ? [-length, width / 2 - length] : [width, width / 2];
    tl.fromTo(spark, { x: from }, { x: to, duration: 0.9, ease: "power2.inOut" }, 0)
      .fromTo(spark, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0)
      .to(spark, { opacity: 0, duration: 0.35 }, 0.6);
  });
  return tl;
}

function animateFrameRails(rails: HTMLElement) {
  const frame = rails.parentElement;
  const comets = rails.querySelectorAll<HTMLElement>("[data-frame-comet]");
  if (!frame || !comets.length) return;

  // Pulses and flares are made later, and ScrollTrigger runs onToggle inside this element's context,
  // so anything made there would pile up in it until the route changes. They're made through
  // `outside.ignore()` instead, tracked, and undone by hand in the cleanup.
  const outside = gsap.context();
  const flares = new Set<gsap.core.Timeline>();
  let active = false;
  let run: gsap.core.Timeline | undefined;
  let next: gsap.core.Tween | undefined;

  const schedule = () => {
    if (active) next = gsap.delayedCall(gsap.utils.random(...PULSE_GAP), pulse);
  };

  // Measured afresh each time, so it keeps up with the frame's content. Made outside any context:
  // its callbacks (the next pulse, the flares) then run outside one too.
  function pulse() {
    next = undefined;
    outside.ignore(() => {
      const height = frame!.offsetHeight;
      const length = comets[0].offsetHeight;
      const top = frame!.getBoundingClientRect().top;
      const pass = gsap.timeline({
        onComplete: () => {
          gsap.set(comets, { opacity: 0 });
          schedule();
        },
      });
      pass.fromTo(
        comets,
        { y: -length, opacity: 1 },
        { y: height, duration: (height + length) / PULSE_SPEED, ease: "none" },
      );
      // The pulse's head reaches a rule's dots `offset / speed` seconds in
      frame!.querySelectorAll<HTMLElement>("[data-frame-rule]").forEach((rule) => {
        if (!rule.offsetWidth) return; // hidden at this breakpoint
        const offset = rule.getBoundingClientRect().top - top;
        pass.call(
          () => {
            // Not drawn in yet, or scrolled back above it
            if (ruleDraws.get(rule)?.progress() !== 1) return;
            const tl = flare(rule).eventCallback("onComplete", () => flares.delete(tl));
            flares.add(tl);
          },
          undefined,
          offset / PULSE_SPEED,
        );
      });
      run = pass;
    });
  }

  // Pulses run only while the frame is well in view; the one under way finishes when it leaves
  ScrollTrigger.create({
    trigger: frame,
    start: "top 70%",
    end: "bottom 30%",
    onToggle: (self) => {
      active = self.isActive;
      if (!active) {
        next?.kill();
        next = undefined;
      } else if (!run?.isActive() && !next) pulse();
    },
  });

  return () => {
    active = false;
    next?.kill();
    run?.kill();
    flares.forEach((tl) => tl.revert());
    gsap.set(comets, { clearProps: "transform,opacity" });
  };
}

/** Data-attribute effects, scanned for across the page */
const EFFECTS: [selector: string, animate: (el: HTMLElement) => void | (() => void)][] = [
  [HEADING_SELECTOR, animateHeading],
  ["[data-frame-rule]", animateFrameRule],
  ["[data-frame-rails]", animateFrameRails],
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
