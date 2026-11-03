"use client";

import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import { Children, useEffect, useId, useRef, useState } from "react";
import { FrameRule } from "@/components/ui/Frame";
import { cn } from "@/utils/cn";

interface ProductCarouselProps {
  /** The heading, beside the arrows */
  title: React.ReactNode;
  /** Names the list of cards for screen readers */
  label: string;
  children: React.ReactNode;
}

/** Plain outlines; the arrow that can move fills with SAVA blue on hover, the one at an end stays as it is */
const arrow = (atEnd: boolean) =>
  cn(
    "center size-10 rounded-full border border-line bg-paper text-muted transition-colors duration-300",
    atEnd ? "cursor-not-allowed" : "hover:border-accent hover:bg-accent hover:text-paper",
  );

/**
 * A row of cards between the frame's rules that scrolls sideways: by swipe, or a card at a time with
 * the arrows beside the title (each turns blue on hover while it can move). Hairlines between the
 * cards, as in the shop grid.
 */
export default function ProductCarousel({ title, label, children }: ProductCarouselProps) {
  const track = useRef<HTMLUListElement>(null);
  const id = useId();
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 1 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    const resize = new ResizeObserver(update);
    resize.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      resize.disconnect();
    };
  }, []);

  /** One card's width along, either way */
  const step = (by: 1 | -1) => {
    const el = track.current;
    const card = el?.firstElementChild;
    if (!el || !(card instanceof HTMLElement)) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: by * card.offsetWidth, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    // No rule on top: the carousel opens under the closing rule of the section before it
    <>
      <div className="flex items-end justify-between gap-6 px-inset py-10">
        {title}
        <div data-reveal className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Previous products"
            aria-controls={id}
            disabled={edges.start}
            onClick={() => step(-1)}
            className={arrow(edges.start)}
          >
            <RiArrowLeftLine className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Next products"
            aria-controls={id}
            disabled={edges.end}
            onClick={() => step(1)}
            className={arrow(edges.end)}
          >
            <RiArrowRightLine className="size-4" />
          </button>
        </div>
      </div>
      <FrameRule />
      {/* The cards rise in turn — up out of the row, which clips them */}
      <ul
        id={id}
        ref={track}
        aria-label={label}
        data-reveal="stagger"
        className="no-scrollbar flex snap-x snap-mandatory divide-x divide-line overflow-x-auto"
      >
        {Children.map(children, (child) => (
          // grid: the card stretches to the row's tallest
          <li className="grid shrink-0 basis-3/4 snap-start sm:basis-1/2 md:basis-1/3 lg:basis-1/4">{child}</li>
        ))}
      </ul>
      <FrameRule />
    </>
  );
}
