"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/*
 * Smooth expand/collapse for a group of native <details>. Without JS the `name` attribute keeps
 * them exclusive; once hydrated we take that over (the browser would otherwise snap the
 * previously open one shut) so the closing item animates too.
 */
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

    // `open` stays true while collapsing, so the intended state lives here
    details.dataset.expanded = String(open);
    gsap.killTweensOf(details);
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
        },
      },
    );
  });

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
