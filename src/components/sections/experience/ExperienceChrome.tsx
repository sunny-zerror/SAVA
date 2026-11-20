"use client";

import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { ScrollTrigger } from "@/lib/gsap";

interface Chapter {
  name: string;
  index: number;
  count: number;
}

/**
 * The page's own chrome, after the Oryzo reference (desktop only): the chapter you're in, bottom
 * left — sections marked data-chapter="<name>", consecutive ones sharing a name counting as one — and
 * a tab on the right edge that runs down to the range (#range). The chapter line inverts against
 * whatever is behind it, so it reads on photos and paper alike.
 */
export default function ExperienceChrome({ tab }: { tab: string }) {
  const lenis = useLenis();
  const [chapter, setChapter] = useState<Chapter | null>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-chapter]"));
    const names = [...new Set(sections.map((section) => section.dataset.chapter!))];
    const triggers = sections.map((section) =>
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        onToggle: ({ isActive }) => {
          if (!isActive) return;
          const name = section.dataset.chapter!;
          setChapter({ name, index: names.indexOf(name), count: names.length });
        },
      }),
    );
    return () => triggers.forEach((trigger) => trigger.kill());
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <>
      {chapter && (
        <p
          aria-hidden="true"
          className="pointer-events-none fixed bottom-6 left-gutter z-35 hidden items-center gap-3 text-kicker text-paper mix-blend-difference md:flex"
        >
          <span className="size-2 rounded-full bg-current" />
          <span className="tabular-nums">
            {pad(chapter.index + 1)} / {pad(chapter.count)}
          </span>
          <span>{chapter.name}</span>
        </p>
      )}
      <a
        href="#range"
        onClick={(event) => {
          if (!lenis) return;
          event.preventDefault();
          lenis.scrollTo("#range");
        }}
        // Narrow enough to sit in the page gutter, clear of the content
        className="fixed top-1/2 right-0 z-35 hidden -translate-y-1/2 items-center gap-2.5 bg-paper px-2 py-5 text-eyebrow text-ink shadow-sm transition-colors [writing-mode:vertical-rl] hover:bg-mist md:flex"
      >
        <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
        {tab}
      </a>
    </>
  );
}
