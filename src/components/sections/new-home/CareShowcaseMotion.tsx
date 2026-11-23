"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const fontSize = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

/**
 * CareShowcase's <section>, pinned for five screens of scroll, scrubbed:
 *   1. the stick stands in the viewfinder (HeroStick lands it as the pin begins) while the huge line
 *      sweeps in from the right behind it, the label climbs to sit on the line and the ring turns
 *   2. the ring goes and the card opens from the viewfinder's size as the first photo fades in, the
 *      stick shrinking down into the photo's dashed circle (`--stick-fit`, 0–1, read by HeroStick);
 *      the huge line shrinks onto the heading and hands over to it as its lines rise, and the label
 *      climbs to sit above them
 *   3. the right-hand strip comes in
 *   4. the photos step through the card as oryzo's do: each holds, then slides out left as the next
 *      slides in (an eased step per photo), while both strips shift one thumbnail in time — the
 *      next photo leaves the right strip at its inner edge, the last one steps out of the left
 *      strip's. The stick rides out with the first photo, fading (`--stick-out`) before it reaches the edge
 * With reduced motion nothing pins: the first photo holds the card, the strip set out beside it.
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
      const left = one('[data-care-track="left"]');
      const right = one('[data-care-track="right"]');
      const slides = q("[data-care-slide]") as HTMLElement[];
      const last = slides.length - 1;

      // One thumbnail plus the gap after it, re-read on every refresh (resize)
      let pitch = 0;
      const measure = () => {
        const thumb = left.firstElementChild as HTMLElement | null;
        pitch = (thumb?.offsetWidth ?? 0) + (parseFloat(getComputedStyle(left).columnGap) || 0);
      };

      // t: which photo has the card (fractional mid-step); intro: the strips' entrance, 0–1
      const gallery = { t: 0, intro: 0 };
      const layout = () => {
        const shift = -gallery.t * pitch;
        // Coming in, the right strip slides in from its side. The left one only ever moves with the photos:
        // pulled left any further, its queued thumbnails would show before their photos have had the card
        const enter = (1 - gallery.intro) * pitch * 0.6;
        // Each sets its whole horizontal offset. Reverting and re-running this (React's dev double mount,
        // Fast Refresh) can leave GSAP reading a photo's last position back as a pixel x, which then
        // added to its xPercent and held the card a photo behind the strips
        gsap.set(left, { x: shift, xPercent: 0, opacity: gallery.intro });
        gsap.set(right, { x: shift + enter, xPercent: 0, opacity: gallery.intro });
        slides.forEach((el, i) => gsap.set(el, { x: 0, xPercent: gsap.utils.clamp(-100, 100, (i - gallery.t) * 100) }));
      };
      measure();
      layout();

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

        const tl = gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=500%",
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              onRefresh: () => {
                measure();
                layout();
              },
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
          //    stick shrinks down into the photo's circle as it goes
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
          .to(lines, { yPercent: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, 2.35)
          // 3. Strip in
          .to(gallery, { intro: 1, duration: 0.8, ease: "power2.out", onUpdate: layout }, 2.8);

        // 4. A step per photo: eased in and out, so each photo holds in the card before the next slides in
        for (let i = 0; i < last; i++) {
          tl.to(gallery, { t: i + 1, duration: 1, ease: "power3.inOut", onUpdate: layout }, 3.8 + i);
        }
        // The stick rides out with the first photo, gone by the time it reaches the card's edge
        tl.to(section, { "--stick-out": 1, duration: 0.4 }, 3.95);
        // Hold on the last photo before the pin lets go
        tl.to({}, { duration: 0.5 });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gallery.intro = 1;
        const settle = () => {
          measure();
          layout();
        };
        settle();
        window.addEventListener("resize", settle);
        return () => window.removeEventListener("resize", settle);
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
