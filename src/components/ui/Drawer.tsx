"use client";

import { RiCloseLine } from "@remixicon/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Side panel with overlay: Esc and overlay click close it, page scroll is paused while open */
export default function Drawer({ open, onClose, title, side = "right", children, footer }: DrawerProps) {
  const lenis = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);
  // The element that had focus before opening (usually the trigger button) gets it back on close
  const openerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) return;
    openerRef.current?.focus();
    openerRef.current = null;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    openerRef.current ??= document.activeElement as HTMLElement | null;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis, onClose]);

  return (
    <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")} inert={!open}>
      <div
        onClick={onClose}
        className={cn("absolute inset-0 bg-ink/40 transition-opacity duration-500", open ? "opacity-100" : "opacity-0")}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "absolute top-0 flex h-full w-full max-w-md flex-col bg-paper transition-transform duration-500 ease-out-expo outline-none",
          side === "right" ? "right-0" : "left-0",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full",
        )}
      >
        <div className="flex h-header shrink-0 items-center justify-between border-b border-line px-6">
          <h2 className="font-secondary text-cta">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="-mr-2 p-2">
            <RiCloseLine className="size-5" />
          </button>
        </div>
        <div data-lenis-prevent className="flex-1 overflow-y-auto">
          {children}
        </div>
        {footer && <div className="shrink-0 border-t border-line p-6">{footer}</div>}
      </div>
    </div>
  );
}
