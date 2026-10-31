"use client";

import { usePathname } from "next/navigation";
import { useEffect, ViewTransition } from "react";

/**
 * Page transitions: the old page fades out, then the new one fades in (globals.css, "Page
 * transitions"). Keyed by pathname — Next keys a root template by the first URL segment only, so
 * /checkout → /checkout/thank-you wouldn't remount it. Search-param changes (shop filters,
 * pagination) keep the key, so they swap without a fade. Header, drawers and the footer's stick are anchored above the
 * page (view-transition-class site-chrome), so the fading snapshots never cover them.
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
    <ViewTransition key={pathname} enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
