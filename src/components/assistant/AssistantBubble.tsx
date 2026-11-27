"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";

/*
 * The decode: a wave runs along the words, left to right. Each letter it reaches shows, flickers
 * through stand-in glyphs in a pale blue, settles on its own character still pale, then turns white.
 * `wave` is how many letters the wave spans; `wordPause` holds it a little at each space.
 */
const DECODE = { duration: 0.5, wave: 12, wordPause: 0.12, scrambleFps: 10, scrambleEnd: 0.5, accentEnd: 0.75 };
const GLYPHS = "[]{}!@#$%^&*_+-=|;:<>?/~0123456789";
const ACCENT = "color-mix(in srgb, var(--color-accent) 45%, var(--color-paper))";

/** A stand-in for letter `index`: the same within one scramble frame, different from the next */
const glyph = (index: number, frame: number) =>
  GLYPHS[(((index * 2654435761) ^ (frame * 340573321)) >>> 0) % GLYPHS.length];

interface Letter {
  span: HTMLSpanElement;
  char: string;
  index: number;
  /** Where along the wave it sits: its index, plus a pause for each space before it */
  at: number;
}

/**
 * The launcher's speech bubble: a SAVA-blue pill with light morphing over it (assistant-bubble),
 * set in mono caps, its words decoding in as it rises in. Each letter takes its own width from the
 * start (hidden until the wave reaches it), and the mono glyphs are all one width, so the bubble never
 * changes size as they arrive; it keeps them while it fades out. Decorative: the launcher's button
 * carries the label.
 */
export default function AssistantBubble({ text, visible }: { text: string; visible: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const el = line.current;
      if (!el || !visible || !text) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.textContent = text;
        return;
      }

      // A span per letter; spaces stay plain text, so the line can still wrap between words
      el.textContent = "";
      const letters: Letter[] = [];
      let pause = 0;
      for (const part of text.split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) {
          el.append(part);
          pause += DECODE.wordPause;
          continue;
        }
        for (const char of part) {
          const span = document.createElement("span");
          span.textContent = char;
          span.style.opacity = "0";
          el.append(span);
          letters.push({ span, char, index: letters.length, at: letters.length + pause });
        }
      }

      const length = letters.length + pause + DECODE.wave;
      const start = gsap.ticker.time;
      const tick = (time: number) => {
        const progress = Math.min((time - start) / DECODE.duration, 1);
        const front = progress * length;
        const frame = Math.floor(time * DECODE.scrambleFps);
        for (const { span, char, index, at } of letters) {
          const reach = (front - at) / DECODE.wave;
          const shown = reach > 0 ? "1" : "0";
          const color = reach > 0 && reach < DECODE.accentEnd ? ACCENT : "";
          const face = reach > 0 && reach < DECODE.scrambleEnd ? glyph(index, frame) : char;
          if (span.style.opacity !== shown) span.style.opacity = shown;
          if (span.style.color !== color) span.style.color = color;
          if (span.textContent !== face) span.textContent = face;
        }
        if (progress >= 1) gsap.ticker.remove(tick);
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    },
    { scope: root, dependencies: [text, visible] },
  );

  return (
    <div
      ref={root}
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute right-0 bottom-[calc(100%+0.75rem)] w-max max-w-65 translate-y-1.5 assistant-bubble rounded-2xl px-4 py-3 text-mono text-paper opacity-0 transition-[opacity,translate] duration-300 ease-[ease]",
        visible && "translate-y-0 opacity-100",
      )}
    >
      {/* Filled by the effect above, never by React, so the decode's spans aren't fought over */}
      <p ref={line} />
    </div>
  );
}
