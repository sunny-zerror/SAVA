"use client";

import { useRef } from "react";
import { careGallery } from "@/lib/care-gallery";
import { gsap, useGSAP } from "@/lib/gsap";

const fontSize = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

/**
 * CabinetPack's <section>, pinned for a scrubbed scroll scene. CabinetTraveller draws the stick and the
 * carton, following the CSS variables tweened here on the section (each 0–1):
 *   1. the stick stands over the middle (landed as the pin begins) while the huge line sweeps in from
 *      the right behind it — on through the whole packing, as /home's does — and the label climbs to
 *      sit on it
 *   2. the carton rises in under the stick, facing us, its top tipped our way (`--box-in`); its lid swings back
 *      and its dust flaps fold out (`--box-open`) as the stick lines up over the opening, turning once
 *      (`--stick-hover`)
 *   3. the stick drops in (`--stick-pack`), and the flaps fold in and the lid shuts over it
 *   4. the closed carton comes up to rest in the middle, standing almost upright (`--box-pose`), as
 *      the line shrinks onto the heading and hands over to it, its lines rising
 *   5. /home's photo card opens round it as the shelf photo fades in, and the carton settles into its
 *      gap on the shelf (`--box-fit`), where CabinetTraveller swaps it for its photo, on the shelf for good
 *   6. the strips fade in and the photos step through the card (careGallery, src/lib/care-gallery.ts), the
 *      carton riding out on its shelf with the first; held on the last before the pin lets go
 * With reduced motion nothing pins and nothing plays: the heading sits beside the shelf photo, its carton
 * in place, the strips set out beside it.
 */
export default function CabinetPackMotion({ children, ...props }: React.ComponentProps<"section">) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      if (!section) return;
      const q = gsap.utils.selector(section);
      const one = (selector: string) => q(selector)[0] as HTMLElement;
      const gallery = careGallery(section);
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const stage = one("[data-pack-stage]");
        const big = one("[data-pack-big]");
        const kicker = one("[data-pack-kicker]");
        const title = one("[data-pack-title]");
        const lines = q("[data-pack-line]");
        const slot = one('[data-model-anchor="pack"]');
        const rest = one('[data-model-anchor="box-end"]');
        const card = one("[data-care-box]");
        const sizer = one("[data-care-sizer]");

        // Positions relative to the stage, so they hold whether or not the pin is engaged
        const rel = (el: Element) => {
          const r = el.getBoundingClientRect();
          const s = stage.getBoundingClientRect();
          return { left: r.left - s.left, top: r.top - s.top, width: r.width, height: r.height };
        };
        // Where the stick stands
        const middle = () => {
          const r = rel(slot);
          return r.top + r.height / 2;
        };
        // The huge line's top, centred on the stick
        const bigTop = () => middle() - big.offsetHeight / 2;
        // The label's own top, from layout (its transform left out)
        const kickerTop = () => (kicker.offsetParent as HTMLElement).offsetTop + kicker.offsetTop;
        // Phones have no room beside the stick: there the label just waits in its place
        const roomBeside = () => rel(kicker).left + kicker.offsetWidth + 16 < rel(slot).left;

        gsap.set(big, { transformOrigin: "0 0" });
        gsap.set(title, { opacity: 1 });
        gsap.set(lines, { yPercent: 105 });
        gsap.set(section, {
          "--box-in": 0,
          "--box-open": 0,
          "--stick-hover": 0,
          "--stick-pack": 0,
          "--box-pose": 0,
          "--box-fit": 0,
        });

        const OPEN_AT = 5.1;
        const STRIPS_AT = 6.5;
        const STEPS_AT = 7.5;

        const tl = gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=1000%",
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              ...gallery.trigger,
            },
          })
          // 1. The line sweeps in from the screen's right edge all through the packing, arriving under the
          //    label (running off the right) as the lid shuts; the label climbs from beside the stick to sit on it
          .fromTo(
            big,
            { x: () => window.innerWidth - stage.getBoundingClientRect().left, y: bigTop },
            { x: () => rel(kicker).left, duration: 3.7, ease: "power1.out" },
            0,
          )
          .fromTo(big, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0)
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
          // 2. The carton rises in under the stick and opens as the stick lines up over it
          .to(section, { "--box-in": 1, duration: 1, ease: "power3.out" }, 0.5)
          .fromTo('[data-pack-shadow="box"]', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.9)
          .to(section, { "--stick-hover": 1, duration: 0.9, ease: "power2.inOut" }, 1.1)
          .to(section, { "--box-open": 1, duration: 0.8, ease: "power1.inOut" }, 1.25)
          // 3. In it goes, and the carton shuts over it
          .to(section, { "--stick-pack": 1, duration: 0.8, ease: "power2.inOut" }, 2.1)
          .to(section, { "--box-open": 0, duration: 0.8, ease: "power1.inOut" }, 2.95)
          // 4. The closed carton comes to rest in the middle; the line shrinks onto the heading and hands over
          .to(section, { "--box-pose": 1, duration: 1, ease: "power2.inOut" }, 3.75)
          .to('[data-pack-shadow="box"]', { opacity: 0, duration: 0.4 }, 3.75)
          .fromTo('[data-pack-shadow="end"]', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 4.25)
          .to(
            big,
            {
              x: () => rel(title).left,
              y: () => rel(title).top,
              scale: () => fontSize(title) / fontSize(big),
              duration: 1,
              ease: "power2.inOut",
            },
            3.75,
          )
          .to(big, { opacity: 0, duration: 0.25 }, 4.35)
          .to(kicker, { y: 0, duration: 1, ease: "power2.inOut" }, 3.75)
          .to(lines, { yPercent: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }, 4.5)
          // 5. The card opens from the carton's size as the shelf photo fades in (white first), and the
          //    carton settles into its gap on the shelf
          .to('[data-pack-shadow="end"]', { opacity: 0, duration: 0.3 }, OPEN_AT)
          .to(section, { "--box-fit": 1, duration: 1.1, ease: "power2.inOut" }, OPEN_AT)
          .to(q("[data-care-back]"), { opacity: 1, duration: 0.2 }, OPEN_AT)
          .fromTo(
            card,
            { width: () => rest.offsetWidth, height: () => rest.offsetHeight },
            { width: () => sizer.offsetWidth, height: () => sizer.offsetHeight, duration: 1.1, ease: "power2.inOut" },
            OPEN_AT,
          )
          .to(q("[data-care-slides]"), { opacity: 1, duration: 0.45 }, OPEN_AT + 0.05)
          .fromTo(q("[data-care-dot]"), { opacity: 0 }, { opacity: 1, duration: 0.3 }, OPEN_AT + 0.6);

        // 6. Strips in, then the photos step through; hold on the last before the pin lets go
        gallery.play(tl, STRIPS_AT, STEPS_AT);
        tl.to({}, { duration: 0.6 });
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
