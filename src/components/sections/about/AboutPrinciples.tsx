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

/** Under the principles: what they add up to, in figures the site's copy already stands behind */
const facts = [
  { figure: "15", label: "Formulation iterations" },
  { figure: "3", label: "Signature scents" },
  { figure: "0", label: "Parabens or artificial dyes" },
];

/**
 * How SAVA is built: the heading and a line of copy, then a photo beside three principles. The open
 * one sits on the brand's deep blue with its copy; pointing at, focusing or tapping another opens it.
 * On wide screens it's one 12-column grid: the photo under the heading in the first five columns, the
 * principles in the right half under the line of copy, running the photo's height — the list level with
 * its top, the facts level with its foot.
 */
export default function AboutPrinciples() {
  const [open, setOpen] = useState(0);
  const id = useId();

  return (
    <section aria-labelledby="about-principles" data-reveal-replay className="relative isolate bg-surface">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-10 mix-blend-multiply" />
      <Frame>
        {/* Laptop up: the heading over the photo, the line of copy over the principles, at the foot of
            its column level with the heading's last line */}
        <div className="grid gap-6 px-inset py-10 lg:grid-cols-12 lg:items-end lg:gap-x-8">
          <div className="flex flex-col gap-4 lg:col-span-6">
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
          <p data-reveal className="max-w-md text-body text-muted lg:col-span-5 lg:col-start-7">
            SAVA combines advanced sweat control with refined fragrance for lasting freshness, comfort, and everyday
            confidence.
          </p>
        </div>
        <FrameRule />

        <div className="grid gap-stack px-inset py-section lg:grid-cols-12 lg:gap-x-8">
          <div
            data-reveal="fade"
            className="relative aspect-4/5 overflow-hidden rounded-2xl max-lg:mx-auto max-lg:w-full max-lg:max-w-md lg:col-span-5 lg:aspect-square"
          >
            <Image
              src="/images/newhome/testimonial/img2.png"
              alt="A woman pressing a hand to a sweat patch on her T-shirt"
              fill
              sizes="(min-width: 64rem) 36vw, 28rem"
              className="object-cover"
            />
          </div>

          <div className="flex flex-col justify-between gap-stack lg:col-span-6 lg:col-start-7">
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
                        "relative isolate w-full overflow-hidden rounded-xl px-6 py-6 text-left transition-colors duration-500 lg:py-8",
                        active ? "text-paper" : "text-ink",
                      )}
                    >
                      {/* The deep blue, with light pooling up from the lower right, fades in under the open one */}
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute inset-0 -z-10 bg-accent transition-opacity duration-500",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      >
                        <span className="absolute inset-0 bg-gradient-light" />
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

            {/* Level with the photo's foot, under a hairline */}
            <dl data-reveal="stagger" className="grid grid-cols-3 gap-4 border-t border-line px-6 pt-6">
              {facts.map(({ figure, label }) => (
                <div key={label} className="flex flex-col-reverse justify-end gap-1">
                  {/* The figure shows over its label; read label first */}
                  <dt className="text-caption text-muted">{label}</dt>
                  <dd className="text-h2 tabular-nums">{figure}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Frame>
    </section>
  );
}
