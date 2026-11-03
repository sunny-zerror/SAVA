"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { cn } from "@/utils/cn";

const principles = [
  {
    title: "Evidence Before Claims",
    text: "Every claim on the pack is backed by testing first — dermatological evaluation and real-world wear trials — so what we promise is what you get.",
  },
  {
    title: "Function Before Fluff",
    text: "SAVA focuses on what matters most: reliable sweat and odour defence. No unnecessary extras, just targeted protection and refined fragrance to help you feel fresh and confident throughout the day.",
  },
  {
    title: "Built for Real Heat",
    text: "Formulated for Indian summers — humid commutes, hot afternoons and long days that would beat an ordinary deodorant by noon.",
  },
];

/**
 * How SAVA is built: the heading and a line of copy, then a photo beside three principles. The open
 * one sits on the brand's deep blue with its copy; pointing at, focusing or tapping another opens it.
 */
export default function AboutPrinciples() {
  const [open, setOpen] = useState(0);
  const id = useId();

  return (
    <section aria-labelledby="about-principles" data-reveal-replay className="relative isolate bg-surface">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-10 mix-blend-multiply" />
      <Frame>
        {/* Laptop up: two columns, as the photo and principles below — the line of copy sits at the
            foot of the right one, level with the heading's last line */}
        <div className="grid gap-6 px-inset py-10 lg:grid-cols-2 lg:items-end lg:gap-8">
          <div className="flex flex-col gap-4">
            <p data-reveal className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              How we build
            </p>
            <h2 id="about-principles" data-heading-effect>
              <span data-heading-line className="block">
                Honest Claims
              </span>
              <span data-heading-line className="block">
                Real Performance
              </span>
            </h2>
          </div>
          <p data-reveal className="max-w-md text-body text-muted lg:justify-self-end">
            SAVA combines advanced sweat control with refined fragrance for lasting freshness, comfort, and everyday
            confidence.
          </p>
        </div>
        <FrameRule />

        <div className="grid gap-stack px-inset py-section md:grid-cols-2 md:items-center lg:gap-8">
          <div data-reveal="fade" className="relative aspect-4/5 overflow-hidden rounded-2xl md:ml-auto md:w-3/5">
            <Image
              src="/images/about/claim_img1.png"
              alt="A woman pressing a hand to a sweat patch on her T-shirt"
              fill
              sizes="(min-width: 48rem) 27vw, 100vw"
              className="object-cover"
            />
          </div>

          <ul data-reveal="stagger" className="flex flex-col">
            {principles.map(({ title, text }, i) => {
              const active = open === i;
              return (
                <li
                  key={title}
                  className={cn("border-b transition-colors", active ? "border-transparent" : "border-line")}
                >
                  <button
                    type="button"
                    aria-expanded={active}
                    aria-controls={`${id}-${i}`}
                    onClick={() => setOpen(i)}
                    onPointerEnter={(event) => event.pointerType === "mouse" && setOpen(i)}
                    onFocus={() => setOpen(i)}
                    className={cn(
                      "relative isolate w-full overflow-hidden rounded-xl px-6 py-6 text-left transition-colors duration-500",
                      active ? "text-paper" : "text-ink",
                    )}
                  >
                    {/* The deep blue, with light pooling up from the lower right, fades in under the open one */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "absolute inset-0 -z-10 bg-navy transition-opacity duration-500",
                        active ? "opacity-100" : "opacity-0",
                      )}
                    >
                      <span className="absolute inset-0 bg-radial-[at_90%_100%] from-accent via-accent/45 to-navy to-75%" />
                      <span className="absolute inset-0 bg-grain opacity-20 mix-blend-overlay" />
                    </span>
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="text-h4">{title}</span>
                      <span className={cn("text-caption tabular-nums", active ? "text-paper/80" : "text-muted")}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </span>
                    {/* Opens by its rows: 0fr → 1fr, so the height animates without measuring */}
                    <span
                      id={`${id}-${i}`}
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-500 ease-out-expo",
                        active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden">
                        <span className="block max-w-lg pt-4 text-caption text-paper/85">{text}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </Frame>
    </section>
  );
}
