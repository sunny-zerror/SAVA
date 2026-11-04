"use client";

import { RiCloseLine } from "@remixicon/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the dialog; also the visible heading unless `heading` is given */
  title: string;
  /**
   * Unique view-transition name: during a route fade the drawer is its own layer above the page
   * (globals.css, "Page transitions"), so a link inside it can close it without the page covering it
   */
  name: string;
  /** Replaces the visible header content (e.g. the wordmark in the menu) */
  heading?: React.ReactNode;
  side?: "left" | "right";
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/**
 * The panel's glide, in and out: long and settling on the site's ease-out-expo, the way a lerp
 * eases in on its target. Set inline below, so these stay the one source of the timing.
 */
export const DRAWER_OPEN_MS = 900;
const DRAWER_CLOSE_MS = 700;

/** Side panel with overlay: Esc and overlay click close it, page scroll is paused while open */
export default function Drawer({ open, onClose, title, name, heading, side = "right", children, footer }: DrawerProps) {
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

  const glide = { transitionDuration: `${open ? DRAWER_OPEN_MS : DRAWER_CLOSE_MS}ms` };

  return (
    <div
      className={cn("fixed inset-0 z-50 [view-transition-class:site-chrome]", !open && "pointer-events-none")}
      style={{ viewTransitionName: name }}
      inert={!open}
    >
      <div
        onClick={onClose}
        style={glide}
        className={cn(
          "absolute inset-0 bg-navy/40 backdrop-blur-[2px] transition-opacity ease-out-expo",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={glide}
        className={cn(
          // One width for every drawer (menu and cart alike): 20% under max-w-xl (36rem)
          "absolute top-0 flex h-full w-full max-w-[28.8rem] flex-col overflow-hidden bg-paper shadow-2xl shadow-navy/20 transition-transform ease-out-expo outline-none",
          side === "right" ? "right-0 sm:rounded-l-3xl" : "left-0 sm:rounded-r-3xl",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full",
        )}
      >
        <div className="flex h-header shrink-0 items-center justify-between gap-4 border-b border-line px-6 md:px-8">
          {heading ?? <h2 className="text-h5">{title}</h2>}
          <button
            onClick={onClose}
            aria-label="Close"
            className="group -mr-1 center size-10 shrink-0 rounded-full bg-surface transition-colors hover:bg-mist"
          >
            <RiCloseLine
              aria-hidden="true"
              className="size-5 transition-transform duration-500 ease-out-expo group-hover:rotate-90"
            />
          </button>
        </div>
        <div data-lenis-prevent className="scrollbar-thin flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
        {footer && <div className="shrink-0 border-t border-line p-6 md:px-8">{footer}</div>}
      </div>
    </div>
  );
}
