"use client";

import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { finishIntro, INTRO_ATTR, introPlayed, onIntroDone } from "@/lib/intro";
import { afterPageEnter, pageEntering } from "@/lib/page-transition";

/**
 * The home page intro, once per page load: the SAVA wordmark fades in from left to right on white,
 * holds, fades out the same way, then the curtain wipes up to reveal the hero. As it clears it
 * signals finishIntro() — the headline rises, the 3D stick arrives — then the announcement bar and the header drop in.
 *
 * Server-rendered so it covers the page from the first paint. Without JS a CSS fallback clears it;
 * with reduced motion it's never shown.
 */
export default function HomeIntro() {
  const root = useRef<HTMLDivElement>(null);
  // Client-side visits back to the home page skip it
  const [show] = useState(() => !introPlayed());
  const lenis = useLenis();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: reduce)", () => {
        finishIntro();
      });
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const announcement = document.querySelector<HTMLElement>("[data-site-announcement]");
        const header = document.querySelector<HTMLElement>("[data-site-header]");
        window.scrollTo(0, 0);
        document.documentElement.style.overflow = "hidden";
        // Arriving by a page transition, the chrome (shown live above the fade) eases out with the
        // old page rather than vanishing at once; on a first load it simply starts hidden
        if (pageEntering()) {
          gsap.to([announcement, header], { yPercent: -100, autoAlpha: 0, duration: 0.28, ease: "power2.in" });
        } else {
          gsap.set([announcement, header], { yPercent: -100, autoAlpha: 0 });
        }
        gsap.set(el, { animation: "none" }); // JS is running — the CSS fallback isn't needed
        // While WebGL warms up behind the curtain the main thread can stall; with lag smoothing a stall
        // pauses the intro instead of skipping it. Off again after (SmoothScroll keeps Lenis in sync with it off).
        gsap.ticker.lagSmoothing(500, 33);

        // Held until the page has fully faded in (when arriving by a page transition), so the
        // wordmark's sweep is seen from its start
        const tl = gsap.timeline({
          paused: true,
          onComplete: () => {
            gsap.ticker.lagSmoothing(0);
            document.documentElement.style.overflow = "";
            el.style.display = "none";
          },
        });
        const offEnter = afterPageEnter(() => tl.play());
        // Wordmark: a soft edge sweeps across left → right to show it, then again to clear it
        tl.to(el, { "--intro-in": "130%", duration: 1.1, ease: "power2.inOut" }, 0.25)
          .to(el, { "--intro-out": "130%", duration: 0.9, ease: "power2.inOut" }, "+=0.35")
          // Curtain wipes up to reveal the hero
          .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 1.1, ease: "expo.inOut" }, "-=0.2")
          // The hero is in view as the wipe eases out: headline (then stick) go
          .call(finishIntro, [], "-=0.15")
          // Top chrome last: announcement bar first, the header following it down
          .to(announcement, { yPercent: 0, autoAlpha: 1, duration: 0.9, ease: "expo.out" }, "+=0.9")
          .to(header, { yPercent: 0, autoAlpha: 1, duration: 1, ease: "expo.out" }, "<0.3");

        return () => {
          offEnter();
          gsap.ticker.lagSmoothing(0);
          document.documentElement.style.overflow = "";
          // Only a real unmount (navigating away mid-intro) ends it early. Strict Mode's dev-only
          // unmount/remount keeps the overlay in the DOM, and must not release the hero behind it.
          window.setTimeout(() => {
            if (!document.querySelector(`[${INTRO_ATTR}]`)) finishIntro();
          });
        };
      });
    },
    { scope: root },
  );

  // Hold smooth scrolling while the curtain is down (Lenis arrives after the first render)
  useEffect(() => {
    if (!lenis || introPlayed()) return;
    lenis.stop();
    const off = onIntroDone(() => lenis.start());
    return () => {
      off();
      lenis.start();
    };
  }, [lenis]);

  if (!show) return null;

  return (
    <div
      ref={root}
      {...{ [INTRO_ATTR]: "" }}
      aria-hidden="true"
      className="fixed inset-0 z-60 center animate-intro-fallback bg-paper [--intro-in:0%] [--intro-out:0%] [clip-path:inset(0%_0%_0%_0%)] motion-reduce:hidden"
    >
      {/* Sweep mask: transparent before --intro-out, solid up to --intro-in, with soft 25% edges */}
      <div className="mask-[linear-gradient(90deg,transparent_calc(var(--intro-out)_-_25%),#000_var(--intro-out),#000_calc(var(--intro-in)_-_25%),transparent_var(--intro-in))]">
        <span className="block h-10 w-52 bg-ink mask-[url(/images/brand/wordmark.png)] mask-contain mask-center mask-no-repeat md:h-12 md:w-64" />
      </div>
    </div>
  );
}
