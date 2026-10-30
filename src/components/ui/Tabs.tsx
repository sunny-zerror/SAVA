"use client";

import { useRef } from "react";
import { cn } from "@/utils/cn";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface TabsProps<T extends string> {
  tabs: TabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  label: string;
  className?: string;
}

/** Accessible tab list (arrow keys move between tabs). Render the panel yourself with tabPanelProps(). */
export function Tabs<T extends string>({ tabs, active, onChange, label, className }: TabsProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + tabs.length) % tabs.length;
    refs.current[next]?.focus();
    onChange(tabs[next].id);
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      // Pill track: the selected tab fills with SAVA blue
      className={cn("no-scrollbar flex w-fit max-w-full gap-1 overflow-x-auto rounded-full bg-surface p-1", className)}
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={cn(
              "h-10 shrink-0 rounded-full px-4 text-sm font-bold transition-colors duration-300 focus-visible:-outline-offset-2 md:px-6",
              selected ? "bg-accent text-paper" : "text-muted hover:bg-paper hover:text-ink",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

export const tabPanelProps = (id: string) => ({
  role: "tabpanel" as const,
  id: `panel-${id}`,
  "aria-labelledby": `tab-${id}`,
  tabIndex: 0,
});
