"use client";

import { useEffect, useRef } from "react";
import { DICTATION_BAR_MS, waveBarHeight } from "@/lib/assistant/dictation";
import { gsap } from "@/lib/gsap";

const BAR_PX = 2;
const GAP_PX = 3;
const DOT_PX = 2;

/**
 * The dictation waveform: a bar every 100ms, scrolling right to left, as tall as the loudest level
 * heard in its slot; dots stand where nothing's been heard yet. Drawn in the canvas's text colour.
 */
export default function DictationWave({ getLevel }: { getLevel: () => number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const color = getComputedStyle(canvas).color;
    const bars: number[] = [];
    let width = 0;
    let height = 0;
    let scale = 1;
    let peak = 0;
    let elapsed = 0;

    const resize = () => {
      scale = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.width = Math.round(canvas.clientWidth * scale);
      height = canvas.height = Math.round(canvas.clientHeight * scale);
    };

    const draw = (_time: number, deltaMs: number) => {
      peak = Math.max(peak, getLevel());
      elapsed += deltaMs;
      if (elapsed >= DICTATION_BAR_MS) {
        elapsed %= DICTATION_BAR_MS;
        bars.push(waveBarHeight(peak));
        peak = 0;
      }
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = color;
      const step = (BAR_PX + GAP_PX) * scale;
      const bar = BAR_PX * scale;
      const dot = DOT_PX * scale;
      const slots = Math.ceil(width / step) + 2;
      if (bars.length > slots) bars.splice(0, bars.length - slots);
      // Slides a bar's width over each 100ms, so the newest comes in smoothly from the right
      const offset = (elapsed / DICTATION_BAR_MS) * step;
      for (let slot = 0; slot < slots; slot++) {
        const x = width - offset - (slot + 1) * step;
        if (x + bar < 0) break;
        if (slot < bars.length) {
          const barHeight = Math.max(2 * scale, bars[bars.length - 1 - slot] * height * 0.9);
          ctx.fillRect(x, (height - barHeight) / 2, bar, barHeight);
        } else {
          ctx.globalAlpha = 0.35;
          ctx.fillRect(x + (bar - dot) / 2, (height - dot) / 2, dot, dot);
          ctx.globalAlpha = 1;
        }
      }
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      observer.disconnect();
    };
  }, [getLevel]);

  return <canvas ref={ref} aria-hidden="true" className="block h-10 min-w-0 flex-1 text-ink" />;
}
