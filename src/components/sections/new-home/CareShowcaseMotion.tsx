"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const fontSize = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

// The gallery's motion, taken from oryzo.ai's own: each photo's inner layer turns 10° and zooms 20%
// as it slides in or out; each step holds still for its first and last 10% of scroll, easing between
const INNER_ROTATION = -10;
const INNER_SCALE = 1.2;
const STEP = 1.4; // Timeline units per photo: about 0.75 of a screen, as there
const sineInOut = gsap.parseEase("sine.inOut");
const cubicInOut = gsap.parseEase("power2.inOut");
/** `value` from a–b mapped to 0–1 (clamped), through `ease` */
const fit = (value: number, a: number, b: number, ease?: (t: number) => number) => {
  const t = gsap.utils.clamp(0, 1, (value - a) / (b - a));
  return ease ? ease(t) : t;
};
/** The photo index for a linear scroll position: whole steps, each eased, with a hold at both ends */
const stepped = (raw: number) => Math.floor(raw) + fit(raw % 1, 0.1, 0.9, sineInOut);

/**
 * CareShowcase's <section>, pinned for about six screens of scroll, scrubbed:
 *   1. the stick stands in the viewfinder (HeroStick lands it as the pin begins) while the huge line
 *      sweeps in from the right behind it, the label climbs to sit on the line and the ring turns
 *   2. the ring goes and the card opens from the viewfinder's size as the first photo fades in, the
 *      stick shrinking down into the photo's dashed circle (`--stick-fit`, 0–1, read by HeroStick);
 *      the huge line shrinks onto the heading and hands over to it as its lines rise, and the label
 *      climbs to sit above them
 *   3. the strips fade in, the right-hand thumbnails sliding in from half a screen out, one after another
 *      (played in time once reached, not scrubbed — as oryzo's)
 *   4. the photos step through the card as oryzo's do: each holds, then slides out left as the next
 *      slides in, its inner layer turning and zooming as it goes; both strips shift one thumbnail in
 *      time. A video plays from its start while its slide is in the card. The stick rides out with
 *      the first photo, fading (`--stick-out`) before it reaches the edge. On the last photo the
 *      left-hand thumbnails slide away, one after another
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
      const left = one('[data-care-track="left"]');
      const right = one('[data-care-track="right"]');
      const slides = q("[data-care-slide]") as HTMLElement[];
      const inners = slides.map((el) => el.querySelector<HTMLElement>("[data-care-inner]"));
      const videos = slides.map((el) => el.querySelector("video"));
      const playing = videos.map(() => false);
      const leftThumbs = Array.from(left.children) as HTMLElement[];
      const rightThumbs = Array.from(right.children) as HTMLElement[];
      const last = slides.length - 1;

      // One thumbnail plus the gap after it, re-read on every refresh (resize)
      let pitch = 0;
      const measure = () => {
        const thumb = left.firstElementChild as HTMLElement | null;
        pitch = (thumb?.offsetWidth ?? 0) + (parseFloat(getComputedStyle(left).columnGap) || 0);
      };

      // raw: the scroll through the photos, linear (stepped() eases it); shown: the strips' fade;
      // show / hide: the right thumbnails sliding in, the left ones sliding away; live: pinned on screen
      const gallery = { raw: 0, shown: 0, show: 0, hide: 0, live: false };
      // Thumbnail j of n slides by `ratio` with the ones before it a little ahead (as oryzo's)
      const stagger = (ratio: number, j: number, n: number) => {
        const d = n > 1 ? j / (n - 1) : 0;
        return fit(ratio, d * 0.2, 0.8 + d * 0.2, cubicInOut);
      };
      const layout = () => {
        const index = stepped(gallery.raw);
        const shift = -index * pitch;
        const half = window.innerWidth / 2;
        // Each sets its whole horizontal offset. Reverting and re-running this (React's dev double mount,
        // Fast Refresh) can leave GSAP reading a photo's last position back as a pixel x, which then
        // added to its xPercent and held the card a photo behind the strips
        gsap.set(left, { x: shift, xPercent: 0, opacity: gallery.shown });
        gsap.set(right, { x: shift, xPercent: 0, opacity: gallery.shown });
        rightThumbs.forEach((el, j) => gsap.set(el, { x: (1 - stagger(gallery.show, j, rightThumbs.length)) * half }));
        leftThumbs.forEach((el, j) => gsap.set(el, { x: -stagger(gallery.hide, j, leftThumbs.length) * half }));

        slides.forEach((el, i) => {
          gsap.set(el, { x: 0, xPercent: gsap.utils.clamp(-100, 100, (i - index) * 100) });
          // -1 sliding in, 0 in the card, 1 sliding out (the last one stays)
          const o = gsap.utils.clamp(-1, i === last ? 0 : 1, index - i);
          gsap.set(inners[i], { rotation: o * INNER_ROTATION, scale: 1 + Math.abs(o) * (INNER_SCALE - 1) });

          // A video plays from its start while its slide is in the card
          const video = videos[i];
          const on = gallery.live && Math.abs(index - i) < 1;
          if (!video || on === playing[i]) return;
          playing[i] = on;
          if (on) {
            video.currentTime = 0;
            video.play().catch(() => {});
          } else video.pause();
        });
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

        // The thumbnails' slides play in time once their point in the scroll is reached, back when it's left
        const show = gsap.to(gallery, { show: 1, duration: 1, ease: "none", paused: true, onUpdate: layout });
        const hide = gsap.to(gallery, { hide: 1, duration: 1, ease: "none", paused: true, onUpdate: layout });
        const STRIPS_AT = 2.8;
        const STEPS_AT = 3.8;
        const HIDE_AT = STEPS_AT + last * STEP - 0.2;
        const cue = (tween: gsap.core.Tween) => {
          let reached = false;
          return (now: boolean) => {
            if (now === reached) return;
            reached = now;
            if (now) tween.play();
            else tween.reverse();
          };
        };
        const cueShow = cue(show);
        const cueHide = cue(hide);

        const tl = gsap
          .timeline({
            defaults: { ease: "none" },
            onUpdate: () => {
              cueShow(tl.time() >= STRIPS_AT);
              cueHide(tl.time() >= HIDE_AT);
            },
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "+=610%",
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              onToggle: (self) => {
                gallery.live = self.isActive;
                layout();
              },
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
          // 3. Strips in (their thumbnails slide in by `show`, cued above)
          .to(gallery, { shown: 1, duration: 0.4, onUpdate: layout }, STRIPS_AT - 0.2)
          // 4. The photos: linear here, stepped() gives each step its holds and easing
          .to(gallery, { raw: last, duration: last * STEP, onUpdate: layout }, STEPS_AT)
          // The stick rides out with the first photo, gone by the time it reaches the card's edge
          .to(section, { "--stick-out": 1, duration: 0.5 }, STEPS_AT + 0.2 * STEP)
          // Hold on the last photo (its left strip sliding away) before the pin lets go
          .to({}, { duration: 0.6 });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gallery.shown = 1;
        gallery.show = 1;
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
