import { gsap, type ScrollTrigger } from "@/lib/gsap";

// The gallery's motion, taken from oryzo.ai's own: each photo's inner layer turns 10° and zooms 20%
// as it slides in or out; each step holds still for its first and last 10% of scroll, easing between
const INNER_ROTATION = -10;
const INNER_SCALE = 1.2;
/** Timeline units per photo: about 0.75 of a screen, as there */
export const CARE_STEP = 1.4;
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
 * The runtime of a CareGallery inside `section`: the photos stepping through the card as oryzo's do —
 * each holds, then slides out left as the next slides in, its inner layer turning and zooming as it
 * goes — and both strips shifting one thumbnail per photo in time. A video plays from its start while
 * its slide is in the card. Set it up once (outside any matchMedia), then `play` it on the section's
 * pinned timeline, or `still` it for reduced motion.
 */
export function careGallery(section: HTMLElement) {
  const q = gsap.utils.selector(section);
  const left = q('[data-care-track="left"]')[0] as HTMLElement;
  const right = q('[data-care-track="right"]')[0] as HTMLElement;
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
  // Set by play(): snaps the thumbnails' slides to where the scene's timeline now is
  let resync = () => {};

  return {
    /**
     * For the scene's ScrollTrigger: videos play only while it's pinned on screen; on a refresh, sizes are
     * re-read and the thumbnails' slides snapped to the scroll (a refresh rewinds the timeline to measure,
     * which would otherwise leave them played back out until the next scroll)
     */
    trigger: {
      onToggle: (self: ScrollTrigger) => {
        gallery.live = self.isActive;
        layout();
      },
      onRefresh: () => {
        measure();
        resync();
        layout();
      },
    },

    /**
     * Adds the gallery to the scene's timeline: the strips fade in at `stripsAt`, their right-hand
     * thumbnails sliding in from half a screen out, one after another (played in time once reached, not
     * scrubbed — as oryzo's); the photos step through from `stepsAt`; on the last photo the left-hand
     * thumbnails slide away. Returns when the steps end.
     */
    play(tl: gsap.core.Timeline, stripsAt: number, stepsAt: number) {
      const show = gsap.to(gallery, { show: 1, duration: 1, ease: "none", paused: true, onUpdate: layout });
      const hide = gsap.to(gallery, { hide: 1, duration: 1, ease: "none", paused: true, onUpdate: layout });
      const hideAt = stepsAt + last * CARE_STEP - 0.2;
      // Plays its tween once its point in the scroll is reached, back when it's left; `snap` sets it there at once
      const cue = (tween: gsap.core.Tween) => {
        let reached = false;
        return (now: boolean, snap = false) => {
          if (snap) {
            reached = now;
            tween.pause().progress(now ? 1 : 0);
            return;
          }
          if (now === reached) return;
          reached = now;
          if (now) tween.play();
          else tween.reverse();
        };
      };
      const cueShow = cue(show);
      const cueHide = cue(hide);
      tl.eventCallback("onUpdate", () => {
        cueShow(tl.time() >= stripsAt);
        cueHide(tl.time() >= hideAt);
      });
      resync = () => {
        cueShow(tl.time() >= stripsAt, true);
        cueHide(tl.time() >= hideAt, true);
      };
      tl.to(gallery, { shown: 1, duration: 0.4, ease: "none", onUpdate: layout }, stripsAt - 0.2)
        // Linear here, stepped() gives each step its holds and easing
        .to(gallery, { raw: last, duration: last * CARE_STEP, ease: "none", onUpdate: layout }, stepsAt);
      return stepsAt + last * CARE_STEP;
    },

    /** Reduced motion: the first photo holds the card, the strips set out beside it; returns the cleanup */
    still() {
      gallery.shown = 1;
      gallery.show = 1;
      const settle = () => {
        measure();
        layout();
      };
      settle();
      window.addEventListener("resize", settle);
      return () => window.removeEventListener("resize", settle);
    },
  };
}
