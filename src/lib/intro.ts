import { afterPageEnter } from "@/lib/page-transition";

/*
 * The home page intro (src/components/sections/home/HomeIntro.tsx) plays once per page load.
 * Things that should wait for it — the hero headline, the 3D stick — subscribe with onIntroDone.
 * The intro's overlay is server-rendered, so its presence in the DOM is the signal: subscribers that
 * mount before the intro's own effect still wait. Anywhere it isn't rendered they run straight away.
 * After a client-side navigation they also wait for the page transition's fade-in to finish
 * (src/lib/page-transition.ts), so page entrances play once the page is fully in view.
 */

export const INTRO_ATTR = "data-home-intro";

let done = false;
const listeners = new Set<() => void>();

const pending = () => !done && !!document.querySelector(`[${INTRO_ATTR}]`);

/** Runs `callback` when the intro (and any page transition) has finished — immediately if neither is running. Returns an unsubscribe. */
export function onIntroDone(callback: () => void) {
  let cancelled = false;
  const offPage = afterPageEnter(() => {
    if (cancelled) return;
    if (!pending()) {
      callback();
      return;
    }
    listeners.add(callback);
  });
  return () => {
    cancelled = true;
    offPage();
    listeners.delete(callback);
  };
}

/** Whether the intro has already played this page load (it doesn't replay on client-side navigation) */
export const introPlayed = () => done;

export function finishIntro() {
  if (done) return;
  done = true;
  listeners.forEach((callback) => callback());
  listeners.clear();
}
