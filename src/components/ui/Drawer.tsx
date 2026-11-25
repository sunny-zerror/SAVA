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
  /** "top" drops down the full width of the page, its content between the frame rails */
  side?: "left" | "right" | "top";
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Takes focus as it opens (e.g. a search field); the panel itself otherwise */
  initialFocus?: React.RefObject<HTMLElement | null>;
}

/** Where each kind of panel sits, and where it waits out of sight */
const panels = {
  // One width for the side drawers (menu and cart alike): 20% under max-w-xl (36rem)
  left: { place: "top-0 left-0 h-full w-full max-w-[28.8rem] sm:rounded-r-3xl", hidden: "-translate-x-full" },
  right: { place: "top-0 right-0 h-full w-full max-w-[28.8rem] sm:rounded-l-3xl", hidden: "translate-x-full" },
  top: { place: "inset-x-0 top-0 max-h-[90svh] rounded-b-3xl", hidden: "-translate-y-full" },
};

/**
 * The panel's glide, in and out: long and settling on the site's ease-out-expo, the way a lerp
 * eases in on its target. Set inline below, so these stay the one source of the timing.
 */
export const DRAWER_OPEN_MS = 900;
const DRAWER_CLOSE_MS = 700;

/** Side (or top) panel with overlay: Esc and overlay click close it, page scroll is paused while open */
export default function Drawer({
  open,
  onClose,
  title,
  name,
  heading,
  side = "right",
  children,
  footer,
  initialFocus,
}: DrawerProps) {
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
    // preventScroll: the panel is still sliding in, and the field mustn't pull its scroll area along
    (initialFocus?.current ?? panelRef.current)?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis, onClose, initialFocus]);

  const top = side === "top";
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
          "absolute flex flex-col overflow-hidden bg-paper shadow-2xl shadow-navy/20 transition-transform ease-out-expo outline-none",
          panels[side].place,
          open ? "translate-0" : panels[side].hidden,
        )}
      >
        <Row
          top={top}
          fill
          className="h-header shrink-0 border-b border-line"
          inner="flex items-center justify-between gap-4"
        >
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
        </Row>
        <div data-lenis-prevent className="min-h-0 scrollbar-thin flex-1 overflow-y-auto overscroll-contain">
          {/* A side panel's content pads itself; a top one's sits between the rails */}
          {top ? <Row top>{children}</Row> : children}
        </div>
        {footer && (
          <Row top={top} className="shrink-0 border-t border-line" inner={top ? "py-5" : "p-6 md:px-8"}>
            {footer}
          </Row>
        )}
      </div>
    </div>
  );
}

/**
 * A band of the panel. In a top panel its content lines up with the page: in the container, between
 * the frame's rails (as in the site header), inset like the sections; in a side panel it's as given.
 */
function Row({
  top,
  fill,
  className,
  inner,
  children,
}: {
  top: boolean;
  /** The rails run the band's full height (a band with a set height, like the header row) */
  fill?: boolean;
  className?: string;
  inner?: string;
  children: React.ReactNode;
}) {
  if (!top) return <div className={cn(className, inner, "px-6 md:px-8")}>{children}</div>;
  return (
    <div className={className}>
      <div className={cn("container", fill && "h-full")}>
        <div className={cn("border-x border-rule px-inset", fill && "h-full", inner)}>{children}</div>
      </div>
    </div>
  );
}
