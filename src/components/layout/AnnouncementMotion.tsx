"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const HOLD = 3;
const MOVE = 0.8;

/**
 * The announcement bar's message list. Below lg the messages share one slot (AnnouncementBar stacks
 * them, each filling the bar's full height) and take turns: each holds for 3s, then the next pushes
 * it up and out of the bar, on a loop. It opens on the middle message — the one shown without
 * motion — so nothing jumps when the loop takes over.
 *
 * Hooks: data-announcement on each message, in order.
 */
export default function AnnouncementMotion({ children, ...props }: React.ComponentProps<"ul">) {
  const root = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference) and (max-width: 63.99rem)", () => {
        const all = gsap.utils.toArray<HTMLElement>("[data-announcement]");
        // Middle first, then on round: 2, 3, 1, 2…
        const items = [...all.slice(1), ...all.slice(0, 1)];

        gsap.set(items[0], { autoAlpha: 1, yPercent: 0 });
        gsap.set(items.slice(1), { autoAlpha: 0, yPercent: 100 });

        // Leaving and arriving share one tween length and ease, so they move as a strip one bar
        // apart. The last step brings the first message back, so the repeat is seamless.
        const tl = gsap.timeline({ repeat: -1, defaults: { duration: MOVE, ease: "power3.inOut" } });
        items.forEach((item, i) => {
          const next = items[(i + 1) % items.length];
          const at = i * (HOLD + MOVE) + HOLD;
          // Plain sets rather than fromTo: a fromTo's start state isn't reapplied on later repeats,
          // so a message would slide in still invisible from the round before
          tl.set(next, { yPercent: 100, autoAlpha: 1 }, at)
            .to(next, { yPercent: 0 }, at)
            .to(item, { yPercent: -100 }, at)
            .set(item, { autoAlpha: 0 }, at + MOVE);
        });
      });
    },
    { scope: root },
  );

  return (
    <ul ref={root} {...props}>
      {children}
    </ul>
  );
}
