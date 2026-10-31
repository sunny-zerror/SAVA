"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import ReviewsCanvas from "./ReviewsCanvas";

/** Open, opening, or still closing (FaqAccordion keeps `open` set until the collapse ends) */
const isLive = (details: HTMLDetailsElement | null) =>
  !!details && (details.open || details.dataset.expanded === "true");

/**
 * The live aurora (ReviewsCanvas) behind an open FAQ item. Each item has one, but it's only mounted
 * while its item is open or animating, so the FAQ holds one WebGL context (two while one item hands
 * over to another) rather than one per question. It fades with the item's expanded state, over the
 * static backdrop that stays for reduced motion / no WebGL. Place it inside the item's <details>
 * (a `group`), after that backdrop.
 */
export default function FaqBackdrop() {
  const [details, setDetails] = useState<HTMLDetailsElement | null>(null);
  const attach = useCallback((el: HTMLSpanElement | null) => setDetails(el?.closest("details") ?? null), []);

  // FaqAccordion flips `open` and data-expanded on the <details>; follow them
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!details) return () => {};
      const observer = new MutationObserver(onChange);
      observer.observe(details, { attributes: true, attributeFilter: ["open", "data-expanded"] });
      return () => observer.disconnect();
    },
    [details],
  );
  const live = useSyncExternalStore(
    subscribe,
    () => isLive(details),
    () => false,
  );

  return (
    <span
      ref={attach}
      aria-hidden="true"
      // A fixed height, taller than any open item and clipped by it: a canvas that followed the
      // item's animating height would have its WebGL buffer resized (and cleared) every frame
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-160 opacity-0 transition-opacity duration-500 group-expanded:opacity-100"
    >
      {live && <ReviewsCanvas className="block size-full" />}
      {/* Navy scrim: the aurora's sky-blue crests are too light for white text on their own.
          It also deepens the static backdrop beneath, for reduced motion / no WebGL. */}
      <span className="absolute inset-0 bg-navy/45" />
    </span>
  );
}
