"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DRAWER_OPEN_MS } from "@/components/ui/Drawer";
import { gsap, useGSAP } from "@/lib/gsap";

/*
 * The motion shared by the side drawers (menu, bag). Mark what moves, anywhere inside the drawer's
 * dialog (the footer included):
 *   data-drawer-line   a block that rises into an overflow-hidden mask of its own, like the headings
 *   data-drawer-rule   a hairline that draws out from the left
 *   data-drawer-extra  fades up after the lines (icons, a footer)
 */
const LINE = "[data-drawer-line]";
const RULE = "[data-drawer-rule]";
const EXTRA = "[data-drawer-extra]";

/**
 * The content rises once the panel is in: 70% into its ease-out glide it's within ~3px of resting,
 * and the rest is a creep no one sees — waiting the full time would read as a pause
 */
const RISE_DELAY = (DRAWER_OPEN_MS * 0.7) / 1000;

interface Motion {
  /** `glideStarted`: resolves when the panel's slide actually begins */
  rise: (glideStarted: Promise<unknown>) => void;
  /** Takes the content out, then calls `done` (straight away if it never came in) */
  sink: (done: () => void) => void;
}

/**
 * Opening: the panel glides in and, once it's settled, the lines rise into their masks while the
 * hairlines draw out, then the extras fade up. Closing — however `open` goes false (the drawer's
 * button, Esc, the overlay, a link, the header) — runs it backwards: the content sinks, last first,
 * and only then does the panel glide away. Give the Drawer `shown` as its `open` (it lags `open` while
 * the content sinks) and `requestClose` as its onClose; put `scope` on an element inside it. Reduced
 * motion: nothing moves and it closes at once.
 */
export function useDrawerMotion({ open, onClose }: { open: boolean; onClose: () => void }) {
  const scope = useRef<HTMLDivElement>(null);
  // Closing keeps the panel shown while the content sinks: set as `open` goes false (during render),
  // cleared when the sink ends
  const [sinking, setSinking] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setSinking(!open);
  }
  const shown = open || sinking;
  // Set while motion is allowed
  const motion = useRef<Motion | null>(null);
  // A sink under way: what ends it (hides the panel)
  const pending = useRef<(() => void) | null>(null);

  // Callers hand over a new onClose each render. Read through a ref, requestClose stays stable —
  // Drawer re-runs its open effect (refocusing the panel) whenever its onClose changes.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);
  const requestClose = useCallback(() => onCloseRef.current(), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", (context) => {
        let tl: gsap.core.Timeline | undefined;
        let risen = false;
        // The whole dialog, so the Drawer's footer (outside `scope`) is found too
        const targets = (selector: string) =>
          gsap.utils.toArray<HTMLElement>(selector, scope.current?.closest('[role="dialog"]') ?? undefined);

        motion.current = {
          rise: (glideStarted) =>
            context.add(() => {
              tl?.kill();
              risen = false;
              const [rules, lines, extras] = [RULE, LINE, EXTRA].map(targets);
              // fromTo: everything is tucked away at once, while the panel glides in
              const rising = (tl = gsap
                .timeline({ paused: true, delay: RISE_DELAY, onStart: () => void (risen = true) })
                .fromTo(
                  rules,
                  { scaleX: 0, transformOrigin: "left center" },
                  { scaleX: 1, duration: 1.4, stagger: 0.09, ease: "expo.out" },
                  0,
                )
                .fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.09, ease: "expo.out" }, 0)
                .fromTo(
                  extras,
                  { y: 16, autoAlpha: 0 },
                  { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.06, ease: "expo.out" },
                  0.35,
                ));
              // The wait counts from the glide's real start: a slow first frame can hold it back
              glideStarted.then(
                () => {
                  if (tl === rising) rising.restart(true);
                },
                () => {},
              );
            }),
          sink: (done) =>
            context.add(() => {
              tl?.kill();
              // Closed before the content came in: nothing to take out
              if (!risen) {
                tl = undefined;
                return done();
              }
              const [rules, lines, extras] = [RULE, LINE, EXTRA].map(targets);
              const out = { stagger: { each: 0.04, from: "end" as const }, ease: "power3.in" };
              tl = gsap
                .timeline({ onComplete: done })
                .to(extras, { y: 16, autoAlpha: 0, duration: 0.4, ease: "power3.in" }, 0)
                .to(rules, { scaleX: 0, transformOrigin: "right center", duration: 0.5, ...out }, 0)
                .to(lines, { yPercent: 110, duration: 0.45, ...out }, 0);
            }),
        };
        return () => {
          motion.current = null;
          // Reduced motion switched on mid-close: the sink was reverted, so finish the close now
          pending.current?.();
        };
      });
      return () => mm.revert();
    },
    { scope },
  );

  useEffect(() => {
    if (open) {
      // Reopened mid-close: the sink is dropped and the content comes back in
      pending.current = null;
      // The panel's slide is a CSS transition on the dialog: `ready` resolves as it starts. Read after
      // the commit that opens it — a frame on, so the transition exists.
      const frame = requestAnimationFrame(() => {
        const glide = scope.current?.closest('[role="dialog"]')?.getAnimations()[0];
        motion.current?.rise(glide?.ready ?? Promise.resolve());
      });
      return () => cancelAnimationFrame(frame);
    }
    const hide = () => {
      if (pending.current !== hide) return;
      pending.current = null;
      setSinking(false);
    };
    pending.current = hide;
    // Reduced motion: nothing to take out, so the panel goes on the next frame
    if (motion.current) motion.current.sink(hide);
    else {
      const frame = requestAnimationFrame(hide);
      return () => cancelAnimationFrame(frame);
    }
  }, [open]);

  return { scope, shown, requestClose };
}
