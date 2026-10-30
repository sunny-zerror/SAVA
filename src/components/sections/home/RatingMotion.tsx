"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * The reviews' rating summary, with its entrance: the score counts up, the hearts pop in one by one,
 * then each bar fills from empty to its share while its percentage counts alongside. Reverses when
 * scrolled back below, to replay. The rendered numbers are the final values (reduced motion, no JS).
 *
 * Hooks (data attributes in HomeReviews): data-rating-score, data-rating-heart, data-rating-bar
 * (the fill), data-rating-share (its percentage text).
 */
export default function RatingMotion({ children, ...props }: React.ComponentProps<"div">) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const scope = root.current;
        if (!scope) return;

        // Counters start at zero; their real text comes back on teardown
        const originals = new Map<Element, string>();

        /** Counts an element's number up from 0 to what it showed, keeping its decimals */
        const countUp = (el: Element, duration: number) => {
          const text = el.textContent ?? "";
          originals.set(el, text);
          const decimals = text.split(".")[1]?.length ?? 0;
          const counter = { value: 0 };
          const show = () => {
            el.textContent = counter.value.toFixed(decimals);
          };
          show();
          return gsap.to(counter, { value: Number(text), duration, ease: "power3.out", onUpdate: show });
        };

        const tl = gsap.timeline({
          scrollTrigger: { trigger: scope, start: "top 80%", toggleActions: "play none none reverse" },
        });

        const score = scope.querySelector("[data-rating-score]");
        if (score) tl.add(countUp(score, 1.6), 0);
        tl.from(
          "[data-rating-heart]",
          { scale: 0, opacity: 0, duration: 0.5, stagger: 0.08, ease: "back.out(2.4)" },
          0.2,
        );

        gsap.utils.toArray<HTMLElement>("[data-rating-bar]").forEach((bar, i) => {
          const at = 0.35 + i * 0.14;
          tl.from(bar, { width: "0%", duration: 1.4, ease: "expo.out" }, at);
          const share = bar.closest("li")?.querySelector("[data-rating-share]");
          if (share) tl.add(countUp(share, 1.4), at);
        });

        return () => originals.forEach((text, el) => (el.textContent = text));
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} {...props}>
      {children}
    </div>
  );
}
