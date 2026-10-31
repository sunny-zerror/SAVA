"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/*
 * Smooth expand/collapse for a group of native <details>. Without JS the `name` attribute keeps
 * them exclusive; once hydrated we take that over (the browser would otherwise snap the
 * previously open one shut) so the closing item animates too.
 *
 * `open` has to stay set while an item collapses (or its content would vanish), so the state it's
 * heading to goes in data-expanded the moment it's toggled. Style items with the `expanded:` /
 * `group-expanded:` variants (globals.css), not `open:`, so colours and icons move with the height
 * rather than catching up once it's done. Children marked data-accordion-content fade up as their
 * item opens.
 */
/** Everything below an item moves as it opens or shuts: one ScrollTrigger re-measure per toggle */
let refreshing: gsap.core.Tween | undefined;
const refreshSoon = () => {
  refreshing?.kill();
  refreshing = gsap.delayedCall(0.05, () => ScrollTrigger.refresh());
};

interface FaqAccordionProps {
  children: React.ReactNode;
  className?: string;
  /** Opening one closes the others (default); false lets each open and close on its own */
  exclusive?: boolean;
}

export default function FaqAccordion({ children, className, exclusive = true }: FaqAccordionProps) {
  const root = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      root.current?.querySelectorAll("details[name]").forEach((details) => details.removeAttribute("name"));
    },
    { scope: root },
  );

  const animate = contextSafe((details: HTMLDetailsElement, open: boolean) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const content = details.querySelectorAll("[data-accordion-content]");
    // Fully shut (not caught mid-collapse), so its content starts from hidden
    const wasShut = !details.open;

    details.dataset.expanded = String(open);
    gsap.killTweensOf([details, ...content]);
    const from = details.offsetHeight;
    // Measure the end state, then keep the content rendered while it collapses
    details.open = open;
    details.style.height = "";
    const to = details.offsetHeight;
    details.open = true;

    gsap.fromTo(
      details,
      { height: from },
      {
        height: to,
        duration: reduced ? 0 : 0.6,
        ease: "power3.inOut",
        onComplete: () => {
          details.open = open;
          gsap.set(details, { clearProps: "height" });
          gsap.set(content, { clearProps: "opacity,transform" });
          refreshSoon();
        },
      },
    );

    if (reduced) return;
    if (open) {
      if (wasShut) gsap.set(content, { opacity: 0, y: 16 });
      gsap.to(content, { opacity: 1, y: 0, duration: 0.7, delay: 0.12, ease: "power3.out" });
    } else {
      gsap.to(content, { opacity: 0, duration: 0.3, ease: "power2.in" });
    }
  });

  // The browser can open an item by itself (find-in-page reveals a match inside a closed one).
  // Our own toggles land mid-tween or already match data-expanded; anything else, adopt.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const onToggle = (event: Event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement) || gsap.isTweening(details)) return;
      if (details.dataset.expanded === undefined || details.dataset.expanded === String(details.open)) return;
      details.dataset.expanded = String(details.open);
      if (details.open && exclusive) {
        el.querySelectorAll("details").forEach((other) => {
          if (other !== details && (other.dataset.expanded ?? String(other.open)) === "true") animate(other, false);
        });
      }
    };
    // toggle doesn't bubble: listen in the capture phase
    el.addEventListener("toggle", onToggle, true);
    return () => el.removeEventListener("toggle", onToggle, true);
  }, [animate, exclusive]);

  const handleClick = (event: React.MouseEvent) => {
    const summary = (event.target as Element).closest("summary");
    const details = summary?.parentElement;
    if (!(details instanceof HTMLDetailsElement) || !root.current?.contains(details)) return;

    event.preventDefault();
    const isExpanded = (el: HTMLDetailsElement) => (el.dataset.expanded ?? String(el.open)) === "true";
    const opening = !isExpanded(details);

    if (opening && exclusive) {
      root.current.querySelectorAll("details").forEach((other) => {
        if (other !== details && isExpanded(other)) animate(other, false);
      });
    }
    animate(details, opening);
  };

  return (
    // Clicks bubble from the <summary> (keyboard Enter/Space fire click too)
    <div ref={root} onClick={handleClick} className={className}>
      {children}
    </div>
  );
}
