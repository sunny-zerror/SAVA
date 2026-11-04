"use client";

import { usePathname } from "next/navigation";
import { useEffect, ViewTransition, type ViewTransitionInstance } from "react";
import { coverPage, CURTAIN_COVER_MS, hasCurtain } from "@/lib/page-transition";

/** The browser's own back/forward swipe already animated this navigation (set below) */
const swiped = () => document.documentElement.dataset.uaNav !== undefined;

/** Keeps a page snapshot at one opacity for as long as the curtain takes to cover the screen */
const hold = (pseudo: ViewTransitionInstance["old"], opacity: number) =>
  pseudo.animate([{ opacity }, { opacity }], { duration: CURTAIN_COVER_MS, fill: "both" });

/**
 * Page transitions: the white curtain (PageCurtain) covers the old page, shows a tagline and lifts
 * off the new one. The browser's view transition holds the old page on screen (and the new one
 * hidden) while the curtain fades in over them; without the curtain (reduced motion) the pages
 * cross-fade instead (globals.css, "Page transitions"). Keyed by pathname — Next keys a root
 * template by the first URL segment only, so /checkout → /checkout/thank-you wouldn't remount it.
 * Search-param changes (shop filters, pagination) keep the key, so they swap without a transition.
 * Header, drawers, the footer's stick and the curtain are anchored above the page
 * (view-transition-class site-chrome), so the page snapshots never cover them.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // A swipe-back/forward gesture has already animated to the destination: skip ours that time
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      if (!event.hasUAVisualTransition) return;
      const root = document.documentElement;
      root.dataset.uaNav = "";
      window.setTimeout(() => delete root.dataset.uaNav, 1000);
    };
    window.addEventListener("popstate", onPopState, { capture: true });
    return () => window.removeEventListener("popstate", onPopState, { capture: true });
  }, []);

  return (
    <ViewTransition
      key={pathname}
      enter="page-in"
      exit="page-out"
      default="none"
      onExit={(instance: ViewTransitionInstance) => {
        if (!swiped() && coverPage()) hold(instance.old, 1);
      }}
      onEnter={(instance: ViewTransitionInstance) => {
        // The curtain (played as the old page left) shows the new page itself, once it lifts
        if (!swiped() && hasCurtain()) hold(instance.new, 0);
      }}
    >
      {children}
    </ViewTransition>
  );
}
