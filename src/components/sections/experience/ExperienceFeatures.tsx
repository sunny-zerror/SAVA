import { RiDropLine, RiShieldCheckLine, RiTimerFlashLine } from "@remixicon/react";
import Image from "next/image";
import { cn } from "@/utils/cn";
import { experienceMedia } from "./media";
import ScrollTrack from "./ScrollTrack";

const features = [
  {
    icon: RiDropLine,
    title: "Stops sweat at the source",
    text: "Aluminium salts slip into the sweat ducts where you apply them and form temporary plugs, so less sweat reaches the surface in the first place. Not masked. Reduced.",
    statement: "Stay dry through the heat",
    caption: "Protection inside the duct",
    glyph: (
      <>
        Al<sup className="text-h3">3+</sup>
      </>
    ),
    image: experienceMedia.features.sweat,
    alt: "A cross-section of skin: mineral salts plugging the top of a sweat duct",
  },
  {
    icon: RiTimerFlashLine,
    title: "Freshness on a timer",
    text: "Time-release scent micro-capsules open as you move, topping up the fragrance through the day — up to 24–48 hours of continuous freshness.",
    statement: "Fresh at 7 am. Fresh at 7 pm.",
    caption: "Released as you move",
    glyph: "24–48h",
    image: experienceMedia.features.scent,
    alt: "Fragrance micro-capsules bursting open in soft light",
  },
  {
    icon: RiShieldCheckLine,
    title: "Kind to sensitive skin",
    text: "Dermatologist approved, non-comedogenic and hypoallergenic — tested for skin compatibility across 120 patients. No parabens, no denatured alcohol, no artificial dyes.",
    statement: "Gentle enough for every day",
    caption: "Patients in dermatological evaluation",
    glyph: "n = 120",
    image: experienceMedia.features.apply,
    alt: "A woman gliding the SAVA stick across her underarm in a bright bathroom",
  },
];

// Every step's pieces sit stacked in one grid cell; the current one fades up
const stack = "col-start-1 row-start-1";
const fade = "opacity-0 transition-opacity duration-700 data-active:opacity-100";

/**
 * Features, pinned, after the Oryzo reference's feature steps: a full-bleed photo per step, a frosted
 * panel over its left third (icon, title, copy, dotted rule and a big statement) and a caption with a
 * formula bottom right. The stick shrinks away into the scene as the chapter arrives.
 */
export default function ExperienceFeatures() {
  return (
    <ScrollTrack
      steps={features.length}
      aria-labelledby="experience-features"
      data-chapter="Features"
      className="h-[400svh]"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-ink text-paper">
        {features.map((feature, i) => (
          <div
            key={feature.title}
            data-step-of={i}
            data-active={i === 0 ? "" : undefined}
            className="absolute inset-0 scale-105 opacity-0 transition-[opacity,scale] duration-1000 ease-out-expo data-active:scale-100 data-active:opacity-100"
          >
            <Image src={feature.image} alt={feature.alt} fill sizes="100vw" className="object-cover" />
          </div>
        ))}

        {/* The stick's exit: it shrinks away into the scene */}
        <div
          aria-hidden="true"
          data-stick="features"
          data-stick-at="0"
          data-stick-fit="0"
          data-stick-turn="4"
          className="absolute top-1/2 left-[66%] aspect-1122/1402 h-[40svh] -translate-1/2"
        />

        <div className="absolute inset-x-0 bottom-0 flex h-[62%] flex-col frost p-inset md:inset-y-0 md:left-0 md:h-auto md:w-[34%] md:pt-[calc(var(--spacing-header)+var(--spacing-announcement)+2rem)]">
          <h2 id="experience-features" className="sr-only">
            What SAVA does
          </h2>
          <div className="grid">
            {features.map(({ icon: Icon, title }, i) => (
              <span
                key={title}
                data-step-of={i}
                data-active={i === 0 ? "" : undefined}
                className={cn(stack, fade, "center size-14 rounded-full bg-paper/15 md:size-18")}
              >
                <Icon className="size-6 md:size-7" aria-hidden="true" />
              </span>
            ))}
          </div>

          <div className="mt-6 grid md:mt-14">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                data-step-of={i}
                data-active={i === 0 ? "" : undefined}
                className={cn(stack, fade)}
              >
                <h3 className="text-kicker">{feature.title}</h3>
                <p className="mt-4 text-body-lg text-paper/85">{feature.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-auto">
            <hr className="border-t border-dotted border-paper/60" />
            <div className="mt-6 grid md:mt-10">
              {features.map((feature, i) => (
                <p
                  key={feature.title}
                  data-step-of={i}
                  data-active={i === 0 ? "" : undefined}
                  className={cn(stack, fade, "text-right text-h2 uppercase")}
                >
                  {feature.statement}
                </p>
              ))}
            </div>
            <ol aria-hidden="true" className="mt-6 flex gap-2">
              {features.map((feature, i) => (
                <li
                  key={feature.title}
                  data-step-of={i}
                  data-active={i === 0 ? "" : undefined}
                  className="size-1.5 rounded-full bg-paper/35 transition-colors duration-500 data-active:bg-paper"
                />
              ))}
            </ol>
          </div>
        </div>

        <div className="absolute top-[calc(var(--spacing-header)+var(--spacing-announcement)+1.5rem)] right-gutter grid text-right md:top-auto md:bottom-gutter">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              aria-hidden="true"
              data-step-of={i}
              data-active={i === 0 ? "" : undefined}
              className={cn(stack, fade, "flex items-center justify-end gap-6")}
            >
              <span className="text-caption max-md:hidden">{feature.caption}</span>
              <span className="text-h1 whitespace-nowrap tabular-nums">{feature.glyph}</span>
            </div>
          ))}
        </div>
      </div>
    </ScrollTrack>
  );
}
