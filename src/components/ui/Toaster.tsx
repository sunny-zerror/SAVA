"use client";

import { RiCheckLine, RiCloseLine, RiErrorWarningLine, RiInformationLine } from "@remixicon/react";
import { useEffect, useRef, useState } from "react";
import { useToastStore, type ToastItem } from "@/store/toast-store";
import { cn } from "@/utils/cn";

const tones = {
  success: { Icon: RiCheckLine, disc: "bg-success", bar: "bg-success" },
  error: { Icon: RiErrorWarningLine, disc: "bg-sale", bar: "bg-sale" },
  info: { Icon: RiInformationLine, disc: "bg-accent", bar: "bg-accent" },
};

/** A toast: counts down to closing itself, held while it's hovered or focused, as react-toastify's do */
function Toast({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const [paused, setPaused] = useState(false);
  // What's left of its time, carried across pauses
  const remaining = useRef(item.duration);
  const { Icon, disc, bar } = tones[item.tone];

  useEffect(() => {
    if (paused || item.leaving) return;
    const startedAt = performance.now();
    const timer = window.setTimeout(() => dismiss(item.id), remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current -= performance.now() - startedAt;
    };
  }, [paused, item.leaving, item.id, dismiss]);

  return (
    <div
      role={item.tone === "error" ? "alert" : "status"}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className={cn(
        "pointer-events-auto relative flex items-start gap-3 overflow-hidden rounded-2xl bg-paper p-4 pr-3 text-ink shadow-xl ring-1 shadow-navy/15 ring-line",
        item.leaving ? "animate-toast-out" : "animate-toast-in",
      )}
    >
      <span aria-hidden="true" className={cn("center size-8 shrink-0 rounded-full text-paper", disc)}>
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 pt-1">
        {item.title && <p className="text-caption font-medium">{item.title}</p>}
        <p className={cn("text-caption", item.title && "text-muted")}>{item.message}</p>
      </div>
      <button
        type="button"
        onClick={() => dismiss(item.id)}
        aria-label="Dismiss"
        className="-mt-1 center size-8 shrink-0 rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
      >
        <RiCloseLine aria-hidden="true" className="size-4" />
      </button>
      {/* The countdown, draining to the left; it stops while the toast is held */}
      <span
        aria-hidden="true"
        style={{ animationDuration: `${item.duration}ms`, animationPlayState: paused ? "paused" : "running" }}
        className={cn(
          "absolute inset-x-0 bottom-0 h-0.75 origin-left animate-toast-progress motion-reduce:hidden",
          bar,
        )}
      />
    </div>
  );
}

/**
 * Renders toasts pushed with toast.success / toast.error / toast.info: top right, sliding in, each
 * counting down to closing itself (held while hovered), newest at the bottom. They report what came
 * back from a submit (saved, sent, refused); field errors show under their fields (form.tsx).
 */
export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed top-4 right-4 z-60 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((item) => (
        // A repeat of the same toast starts its countdown over
        <Toast key={`${item.id}-${item.round}`} item={item} />
      ))}
    </div>
  );
}
