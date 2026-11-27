"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AssistantBubble from "@/components/assistant/AssistantBubble";
import { ASSISTANT_DIALOG_ID, assistantConfig, isAssistantHidden } from "@/config/assistant";
import { paintAssistantGradient, readLauncherColors } from "@/lib/assistant/painter";
import { gsap } from "@/lib/gsap";
import { useAssistantStore } from "@/store/assistant-store";
import type { SearchProduct } from "@/types";

const loadOverlay = () => import("@/components/assistant/AssistantOverlay");
const AssistantOverlay = dynamic(loadOverlay, { ssr: false });

/** Set once the intro bubble has shown in this browser session */
const INTRO_KEY = "zc-assistant-intro";

const introShown = () => {
  try {
    return sessionStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
};

const markIntroShown = () => {
  try {
    sessionStorage.setItem(INTRO_KEY, "1");
  } catch {
    // No storage: the bubble shows once a page load instead
  }
};

/** Runs `callback` once the page has loaded and the browser is idle; returns a cancel */
function afterPageLoad(callback: () => void) {
  let idle: number | undefined;
  let timer: number | undefined;
  const run = () => {
    // Safari has no requestIdleCallback
    if (typeof window.requestIdleCallback === "function")
      idle = window.requestIdleCallback(callback, { timeout: 2000 });
    else timer = window.setTimeout(callback, 200);
  };
  if (document.readyState === "complete") run();
  else window.addEventListener("load", run, { once: true });
  return () => {
    window.removeEventListener("load", run);
    if (idle !== undefined) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
}

/**
 * The shopping assistant's button, at the bottom right of every page but checkout: a glowing bubble,
 * light moving inside it and burning white where it gathers (the canvas starts after the page's load, at half the frame rate, and
 * rests while the assistant covers it). Hovering shows a speech bubble, and once a visit it says hello
 * by itself. The assistant itself (AssistantOverlay) is fetched on the first hover, focus or click, so
 * it adds nothing to a page's first load.
 */
export default function AssistantLauncher({ products }: { products: SearchProduct[] }) {
  const pathname = usePathname();
  const hidden = isAssistantHidden(pathname);
  const isOpen = useAssistantStore((s) => s.isOpen);
  const hasOpened = useAssistantStore((s) => s.hasOpened);
  // The overlay is mounted from the first click on, so the conversation's DOM stays between opens
  const [mounted, setMounted] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [intro, setIntro] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const paused = useRef(false);

  const bubble = hovered ? assistantConfig.hoverBubble : intro ? assistantConfig.introBubble : "";
  // The bubble keeps its words while it fades out
  const [lastBubble, setLastBubble] = useState(bubble);
  if (bubble && bubble !== lastBubble) setLastBubble(bubble);

  // A page that hides the assistant closes it
  useEffect(() => {
    if (hidden && isOpen) useAssistantStore.getState().close();
  }, [hidden, isOpen]);

  useEffect(() => {
    paused.current = isOpen;
  }, [isOpen]);

  // The light inside the button
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d");
    if (hidden || !el || !ctx) return;
    const colors = readLauncherColors();
    const startedAt = performance.now();
    let size = 0;
    let skip = false;
    let running = false;

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      size = el.clientWidth;
      el.width = el.height = Math.round(size * scale);
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };
    const paint = () =>
      paintAssistantGradient(ctx, colors, size, size, (performance.now() - startedAt) / 1000 + 1.5, { bright: true });
    // Half the frame rate, and nothing while the assistant covers the button
    const tick = () => {
      skip = !skip;
      if (!skip && !paused.current) paint();
    };

    const observer = new ResizeObserver(() => {
      resize();
      paint();
    });
    observer.observe(el);
    // It never competes with the page's first paint; with reduced motion it stays as first drawn
    const cancel = afterPageLoad(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      running = true;
      gsap.ticker.add(tick);
    });
    return () => {
      cancel();
      if (running) gsap.ticker.remove(tick);
      observer.disconnect();
    };
  }, [hidden]);

  // Once a visit, a hello a few seconds after the page has loaded, unless they've opened it already
  useEffect(() => {
    if (hidden || hasOpened || introShown()) return;
    let show: number | undefined;
    const cancel = afterPageLoad(() => {
      show = window.setTimeout(() => {
        if (useAssistantStore.getState().hasOpened || introShown()) return;
        markIntroShown();
        setIntro(true);
        // Left to run even if this effect is cleaned up, so the bubble never stays stuck open
        window.setTimeout(() => setIntro(false), assistantConfig.introShowMs);
      }, assistantConfig.introDelayMs);
    });
    return () => {
      cancel();
      window.clearTimeout(show);
    };
  }, [hidden, hasOpened]);

  const prefetch = () => {
    loadOverlay().catch(() => {});
  };

  const open = () => {
    const rect = button.current?.getBoundingClientRect();
    setHovered(false);
    setIntro(false);
    markIntroShown();
    setMounted(true);
    useAssistantStore.getState().open(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null);
  };

  if (hidden) return null;

  return (
    <>
      {/* Anchored above the page during route fades (globals.css, "Page transitions"), like the header */}
      <div className="fixed right-4 bottom-4 z-45 [view-transition-class:site-chrome] [view-transition-name:assistant-launcher] md:right-8 md:bottom-6">
        <AssistantBubble text={lastBubble} visible={Boolean(bubble) && !isOpen} />
        <button
          ref={button}
          type="button"
          aria-label="Open the SAVA assistant"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={mounted ? ASSISTANT_DIALOG_ID : undefined}
          onClick={open}
          onPointerEnter={(event) => {
            prefetch();
            if (event.pointerType === "mouse") setHovered(true);
          }}
          onPointerLeave={() => setHovered(false)}
          onFocus={(event) => {
            prefetch();
            // Keyboard focus shows the bubble too, but not focus handed back as the assistant closes
            if (useAssistantStore.getState().phase !== "exiting" && event.currentTarget.matches(":focus-visible")) {
              setHovered(true);
            }
          }}
          onBlur={() => setHovered(false)}
          // A navy hairline keeps its edge where the white light meets a white page
          className="group relative block size-11 rounded-full bg-navy ring-1 ring-navy/15 md:size-13"
        >
          {/* A glow that grows beneath it on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -z-10 scale-60 rounded-full bg-accent opacity-0 blur-md transition duration-400 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
          />
          <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-full">
            {/* A touch more colour and contrast, so the light reads as a glowing bubble */}
            <canvas ref={canvas} className="block size-full contrast-105 saturate-120" />
          </span>
        </button>
      </div>
      {mounted && <AssistantOverlay products={products} launcher={button} />}
    </>
  );
}
