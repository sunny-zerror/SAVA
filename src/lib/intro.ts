/*
 * The home page intro (src/components/sections/home/HomeIntro.tsx) plays once per page load.
 * Things that should wait for it — the hero headline, the 3D stick — subscribe with onIntroDone.
 * The intro's overlay is server-rendered, so its presence in the DOM is the signal: subscribers that
 * mount before the intro's own effect still wait. Anywhere it isn't rendered they run straight away.
 */

export const INTRO_ATTR = "data-home-intro";

let done = false;
const listeners = new Set<() => void>();

const pending = () => !done && !!document.querySelector(`[${INTRO_ATTR}]`);

/** Runs `callback` when the intro has finished (immediately if there's none). Returns an unsubscribe. */
export function onIntroDone(callback: () => void) {
  if (!pending()) {
    callback();
    return () => {};
  }
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/** Whether the intro has already played this page load (it doesn't replay on client-side navigation) */
export const introPlayed = () => done;

export function finishIntro() {
  if (done) return;
  done = true;
  listeners.forEach((callback) => callback());
  listeners.clear();
}
