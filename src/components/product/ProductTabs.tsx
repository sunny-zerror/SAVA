"use client";

import { useRef, useState } from "react";
import { FrameRule } from "@/components/ui/Frame";
import { Tabs, tabPanelProps } from "@/components/ui/Tabs";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

export interface ProductTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

/**
 * The tab bar across the frame, a rule, then the panels. Every panel is rendered (so all the copy is
 * in the page for search); the inactive ones are hidden. Bar and panel rise in as they scroll into
 * view; a newly chosen panel's blocks then fade up in turn.
 */
export default function ProductTabs({ tabs, label }: { tabs: ProductTab[]; label: string }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const root = useRef<HTMLDivElement>(null);
  const chosen = useRef(false);

  const choose = (id: string) => {
    chosen.current = true;
    setActive(id);
  };

  useGSAP(
    () => {
      // Not on load: the page's scroll reveals bring the first panel in
      if (!chosen.current) return;
      // Panels differ in height, so everything below has moved: re-measure the scroll-triggered effects
      ScrollTrigger.refresh();
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          `#panel-${active} > * > *`,
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, stagger: 0.07, ease: "expo.out" },
        );
      });
    },
    // Reverted on each switch, so a panel left mid-fade is back to rest when it's next shown
    { scope: root, dependencies: [active], revertOnUpdate: true },
  );

  return (
    <div ref={root}>
      <div data-reveal className="px-inset py-8">
        <Tabs tabs={tabs} active={active} onChange={choose} label={label} stretch />
      </div>
      <FrameRule />
      {tabs.map((tab) => (
        <div
          key={tab.id}
          {...tabPanelProps(tab.id)}
          data-reveal
          hidden={tab.id !== active}
          className="px-inset py-10 focus-visible:-outline-offset-2 md:py-14"
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
