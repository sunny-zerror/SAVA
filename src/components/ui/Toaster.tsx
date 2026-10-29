"use client";

import { RiCheckLine, RiCloseLine, RiErrorWarningLine, RiInformationLine } from "@remixicon/react";
import { useToastStore } from "@/store/toast-store";
import { cn } from "@/utils/cn";

const icons = { success: RiCheckLine, error: RiErrorWarningLine, info: RiInformationLine };

/** Renders toasts pushed with toast.success / toast.error / toast.info */
export default function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => {
        const Icon = icons[t.tone];
        return (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="pointer-events-auto flex animate-fade-up items-start gap-3 bg-ink p-4 text-caption text-paper shadow-lg"
          >
            <Icon className={cn("mt-0.5 size-4 shrink-0", t.tone === "error" && "text-red-300")} />
            <p className="flex-1">{t.message}</p>
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss">
              <RiCloseLine className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
