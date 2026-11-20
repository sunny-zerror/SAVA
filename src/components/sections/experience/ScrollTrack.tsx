"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/utils/cn";

type ScrollTrackProps = React.ComponentProps<"section"> & {
  /** How many steps the travel is split into (data-step 0 … steps − 1) */
  steps?: number;
};

/**
 * A tall section around a sticky frame (`sticky top-0 h-svh`) that holds still while the page scrolls
 * through it: the /home page's pinned chapters. As it's scrolled through it writes its progress
 * (0 → 1) to --track and its step to data-step, and sets data-active on the elements inside marked
 * data-step-of="<step>" (or "1 2" for several) while their step is on — so the markup follows with
 * plain CSS (data-active:opacity-100, a transform on var(--track)). Server-render data-active on the
 * step-0 elements so the first frame shows before this runs. ExperienceStage times the stick's
 * keyframes inside (data-stick-at) against the same travel.
 */
export default function ScrollTrack({ steps = 1, className, style, children, ...props }: ScrollTrackProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;
    const items = Array.from(track.querySelectorAll<HTMLElement>("[data-step-of]")).map((el) => ({
      el,
      on: el.dataset.stepOf!.split(/[\s,]+/).map(Number),
    }));

    let current = -1;
    const update = (progress: number) => {
      track.style.setProperty("--track", progress.toFixed(4));
      const step = Math.min(steps - 1, Math.floor(progress * steps));
      if (step === current) return;
      current = step;
      track.dataset.step = String(step);
      for (const { el, on } of items) el.toggleAttribute("data-active", on.includes(step));
    };

    const trigger = ScrollTrigger.create({
      trigger: track,
      start: "top top",
      end: "bottom bottom",
      onUpdate: ({ progress }) => update(progress),
      onRefresh: ({ progress }) => update(progress),
    });
    update(trigger.progress);
    return () => trigger.kill();
  }, [steps]);

  return (
    <section
      ref={ref}
      data-track
      data-step="0"
      style={{ "--track": 0, ...style } as React.CSSProperties}
      className={cn("relative", className)}
      {...props}
    >
      {children}
    </section>
  );
}
