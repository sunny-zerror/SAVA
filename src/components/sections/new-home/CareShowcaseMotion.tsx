"use client";

import { useRef } from "react";
import { CARE_STEP, careGallery } from "@/lib/care-gallery";
import { gsap, useGSAP } from "@/lib/gsap";

const fontSize = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

/**
 * CareShowcase's <section>, pinned for about six screens of scroll, scrubbed:
 *   1. the stick stands in the viewfinder (HeroStick lands it as the pin begins) while the huge line
 *      sweeps in from the right behind it, the label climbs to sit on the line and the ring turns
 *   2. the ring goes and the card opens from the viewfinder's size as the first photo fades in, the
 *      stick shrinking down into its place in the photo (`--stick-fit`, 0–1, read by HeroStick and CabinetTraveller);
 *      the huge line shrinks onto the heading and hands over to it as its lines rise, and the label
 *      climbs to sit above them
 *   3. the strips fade in, the right-hand thumbnails sliding in from half a screen out, one after another
 *      (played in time once reached, not scrubbed — as oryzo's)
 *   4. the photos step through the card as oryzo's do (careGallery, src/lib/care-gallery.ts). The
 *      stick rides out with the first photo, fading (`--stick-out`) before it reaches the edge. On the
 *      last photo the left-hand thumbnails slide away
 * With reduced motion nothing pins and nothing plays: the first photo holds the card, the strips set out beside it.
 */
export default function CareShowcaseMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const one = (selector: string) => q(selector)[0] as HTMLElement;
      const stage = one("[data-care-stage]");
      const sizer = one("[data-care-sizer]");
      const gallery = careGallery(section);

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const big = one("[data-care-big]");
        const kicker = one("[data-care-kicker]");
        const title = one("[data-care-title]");
        const lines = q("[data-care-line]");
        const box = one("[data-care-box]");
        const reticle = one("[data-care-reticle]");
        const slot = one('[data-model-anchor="care"]');

        // Positions relative to the stage, so they hold whether or not the pin is engaged
        const rel = (el: Element) => {
          const r = el.getBoundingClientRect();
          const s = stage.getBoundingClientRect();
          return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
        };
        // Where the stick stands: the middle of the space under the header
        const middle = () => {
          const r = rel(slot);
          return r.top + r.height / 2;
        };
        // The huge line's top, centred on the stick
        const bigTop = () => middle() - big.offsetHeight / 2;
        // The label's own top, from layout (its transform left out)
        const kickerTop = () => (kicker.offsetParent as HTMLElement).offsetTop + kicker.offsetTop;
        // Phones have no room beside the viewfinder: there the label just waits in its place
        const roomBeside = () => rel(kicker).left + kicker.offsetWidth + 16 < rel(slot).left;

        gsap.set(big, { transformOrigin: "0 0" });
        gsap.set(title, { opacity: 1 });
        gsap.set(lines, { yPercent: 105 });
        gsap.set(section, { "--stick-fit": 0, "--stick-out": 0 });

        const STRIPS_AT = 2.8;
        const STEPS_AT = 3.8;

        const tl = gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=610%",
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              ...gallery.trigger,
            },
          })
          // 1. The line sweeps in from the screen's right edge to start under the label (running off the
          //    right, the stick standing in its "C"); the label climbs from beside the stick to sit on it
          .fromTo(
            big,
            { x: () => window.innerWidth - stage.getBoundingClientRect().left, y: bigTop },
            { x: () => rel(kicker).left, duration: 1.6, ease: "power2.out" },
            0,
          )
          .fromTo(big, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
          .fromTo(
            kicker,
            { y: () => (roomBeside() ? middle() - kickerTop() - kicker.offsetHeight / 2 : 0) },
            {
              y: () => (roomBeside() ? bigTop() - kicker.offsetHeight - 12 - kickerTop() : 0),
              duration: 1.2,
              ease: "power2.inOut",
            },
            0.2,
          )
          .to(reticle, { rotation: 30, duration: 1.6 }, 0)
          // 2. The card opens as the photo fades in (white first, so the line passes behind it), and the
          //    stick shrinks down into its place in the photo as it goes
          .to(reticle, { opacity: 0, scale: 1.12, duration: 0.5 }, 1.4)
          .to(section, { "--stick-fit": 1, duration: 1.1, ease: "power2.inOut" }, 1.5)
          .to(q("[data-care-back]"), { opacity: 1, duration: 0.2 }, 1.5)
          .fromTo(
            box,
            { width: () => slot.offsetWidth, height: () => slot.offsetHeight },
            { width: () => sizer.offsetWidth, height: () => sizer.offsetHeight, duration: 1.1, ease: "power2.inOut" },
            1.5,
          )
          .to(q("[data-care-slides]"), { opacity: 1, duration: 0.45 }, 1.55)
          .to(
            big,
            {
              x: () => rel(title).left,
              y: () => rel(title).top,
              scale: () => fontSize(title) / fontSize(big),
              duration: 1,
              ease: "power2.inOut",
            },
            1.6,
          )
          .to(big, { opacity: 0, duration: 0.25 }, 2.2)
          .to(kicker, { y: 0, duration: 1, ease: "power2.inOut" }, 1.6)
          .to(lines, { yPercent: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, 2.35);

        // 3–4. Strips in, then the photos step through
        gallery.play(tl, STRIPS_AT, STEPS_AT);
        tl
          // The stick rides out with the first photo, gone by the time it reaches the card's edge
          .to(section, { "--stick-out": 1, duration: 0.5 }, STEPS_AT + 0.2 * CARE_STEP)
          // Hold on the last photo (its left strip sliding away) before the pin lets go
          .to({}, { duration: 0.6 });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => gallery.still());
    },
    { scope: root },
  );

  return (
    <section ref={root} {...props}>
      {children}
    </section>
  );
}
