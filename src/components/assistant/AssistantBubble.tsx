"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

/**
 * The launcher's speech bubble: navy lit by a pool of drifting SAVA blue, its words decoding in letter
 * by letter as it appears. A hidden copy of the words sizes it, so it doesn't grow as they arrive; it
 * keeps them while it fades out. Decorative: the launcher's button carries the label.
 */
export default function AssistantBubble({ text, visible }: { text: string; visible: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const live = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = live.current;
      if (!el || !visible || !text) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = text;
        return;
      }
      el.textContent = "";
      gsap.to(el, {
        duration: 0.5,
        ease: "none",
        overwrite: true,
        scrambleText: { text, chars: "upperCase", speed: 0.6 },
      });
    },
    { scope: root, dependencies: [text, visible] },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute right-0 bottom-[calc(100%+0.75rem)] w-max translate-y-1.5 assistant-bubble overflow-hidden rounded-2xl px-4 py-3 text-eyebrow text-paper opacity-0 shadow-lg shadow-navy/25 transition-[opacity,translate] duration-300",
        visible && "translate-y-0 opacity-100",
      )}
    >
      {/* One line throughout: the scrambling capitals run wider than the words and would wrap mid-decode */}
      <p className="relative whitespace-nowrap">
        <span className="invisible">{text}</span>
        <span ref={live} className="absolute inset-0 overflow-hidden" />
      </p>
    </div>
  );
}
