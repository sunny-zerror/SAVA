"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

interface CountUpProps {
  value: number;
  decimals?: number;
  className?: string;
}

/** A figure that counts up from zero as it scrolls into view — shown as is for reduced motion */
export default function CountUp({ value, decimals = 0, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const text = (n: number) => n.toFixed(decimals);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const counter = { n: 0 };
        el.textContent = text(0);
        gsap.to(counter, {
          n: value,
          duration: 1.8,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = text(counter.n);
          },
        });
        return () => {
          el.textContent = text(value);
        };
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {text(value)}
    </span>
  );
}
