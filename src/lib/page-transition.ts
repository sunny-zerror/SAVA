/*
 * Page transitions (src/app/template.tsx) fade the old page out and the new one in through the
 * browser's View Transitions API, which React starts with document.startViewTransition. The new
 * page is in the DOM — its layout effects run, observers fire — as the fade begins, so entrance
 * animations started then would play while it's still faint (and their setup would make the fade
 * stutter). afterPageEnter holds a callback until the running transition has finished; with none
 * running (first load, browsers without view transitions) it runs straight away.
 *
 * startViewTransition is wrapped once here to see transitions start and finish, with a safety
 * timeout in case one never settles.
 */

const SAFETY_MS = 2000;

let running = 0;
const waiting = new Set<() => void>();

function settle() {
  running = Math.max(0, running - 1);
  if (running) return;
  const due = [...waiting];
  waiting.clear();
  due.forEach((callback) => callback());
}

if (typeof document !== "undefined" && typeof document.startViewTransition === "function") {
  const start = document.startViewTransition.bind(document);
  document.startViewTransition = ((...args: Parameters<typeof start>) => {
    const transition = start(...args);
    running++;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      settle();
    };
    transition.finished.finally(finish);
    window.setTimeout(finish, SAFETY_MS);
    return transition;
  }) as typeof document.startViewTransition;
}

/** Whether a page transition is running (the new page is still fading in) */
export const pageEntering = () => running > 0;

/** Runs `callback` once the running page transition has finished (straight away if none). Returns a cancel. */
export function afterPageEnter(callback: () => void) {
  if (!running) {
    callback();
    return () => {};
  }
  waiting.add(callback);
  return () => {
    waiting.delete(callback);
  };
}
