"use client";

import { RiCheckLine, RiCloseLine, RiErrorWarningLine, RiInformationLine } from "@remixicon/react";
import { useToastStore } from "@/store/toast-store";
import { cn } from "@/utils/cn";

const tones = {
  success: { Icon: RiCheckLine, disc: "bg-success" },
  error: { Icon: RiErrorWarningLine, disc: "bg-sale" },
  info: { Icon: RiInformationLine, disc: "bg-accent" },
};

/** Renders toasts pushed with toast.success / toast.error / toast.info */
export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-60 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const { Icon, disc } = tones[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex animate-fade-up items-center gap-3 rounded-2xl bg-ink p-3 text-caption text-paper shadow-xl shadow-navy/20"
          >
            <span aria-hidden="true" className={cn("center size-8 shrink-0 rounded-full text-paper", disc)}>
              <Icon className="size-4" />
            </span>
            <p className="flex-1">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="center size-8 shrink-0 rounded-full transition-colors hover:bg-paper/10"
            >
              <RiCloseLine aria-hidden="true" className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
