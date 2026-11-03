"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The announcement bar's message list. Below lg the messages share one slot (AnnouncementBar stacks
 * them) and take turns: each holds for 3s, then rises out as the next rises in, on a loop. It opens
 * on the middle message — the one shown without motion — so nothing jumps when the loop takes over.
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

        // Each pass ends with the first message back in place, so the repeat is seamless
        const tl = gsap.timeline({ repeat: -1 });
        items.forEach((item, i) => {
          const next = items[(i + 1) % items.length];
          tl.to(item, { yPercent: -100, autoAlpha: 0, duration: 0.6, ease: "power3.in" }, "+=3").fromTo(
            next,
            { yPercent: 100, autoAlpha: 0 },
            { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: "power3.out" },
            "<0.2",
          );
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
