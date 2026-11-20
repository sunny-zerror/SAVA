import { RiArrowDownSLine } from "@remixicon/react";
import Image, { getImageProps } from "next/image";
import { experienceMedia } from "./media";
import VideoTile from "./VideoTile";

// Art direction: the landscape tabletop on wider screens, the portrait one on phones. Fetched eagerly at
// high priority (the page's largest paint) — a preload would fetch one crop whatever the screen.
const background = { alt: "", fill: true, sizes: "100vw", loading: "eager", fetchPriority: "high" } as const;
const {
  props: { srcSet: wide },
} = getImageProps({ ...background, src: experienceMedia.hero.desktop });
const {
  props: { srcSet: tall, ...backgroundImage },
} = getImageProps({ ...background, src: experienceMedia.hero.mobile });

/**
 * Intro, after the Oryzo hero: a top-down tabletop with the stick lying on it (the 3D one —
 * ExperienceStage — once live), the wordmark set huge across the top, the promise on the right, a
 * frosted card bottom left and the film tile bottom right. Pulled up under the transparent header.
 */
export default function ExperienceHero() {
  return (
    <section
      aria-labelledby="experience-hero"
      data-chapter="Intro"
      data-reveal-sequence
      className="relative isolate -mt-[calc(var(--spacing-header)+var(--spacing-announcement))] h-svh min-h-160 overflow-hidden bg-navy text-paper"
    >
      <picture>
        <source media="(min-width: 48rem)" srcSet={wide} />
        <source srcSet={tall} />
        <img {...backgroundImage} alt="" className="-z-10 object-cover" />
      </picture>
      {/* Holds the type off the busiest parts of the photo */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-b from-ink/40 via-ink/5 to-ink/45" />

      <div className="relative container h-full">
        <div className="absolute inset-x-gutter top-[calc(var(--spacing-header)+var(--spacing-announcement)+1.5rem)]">
          <p data-reveal className="text-kicker md:ml-[24%]">
            Made for heat. Built for movement.
          </p>
          <h1 id="experience-hero" className="mt-3 md:w-[56%]">
            <span className="sr-only">SAVA antiperspirant deodorant stick</span>
            <span
              aria-hidden="true"
              data-reveal="fade"
              className="block aspect-3870/743 w-full bg-current mask-[url(/images/brand/wordmark.svg)] mask-contain mask-center mask-no-repeat"
            />
          </h1>
        </div>

        <p
          data-reveal
          className="absolute inset-x-gutter bottom-24 text-lead md:inset-x-auto md:top-[44%] md:right-20 md:bottom-auto md:w-104"
        >
          Designed to block sweat, outlast the heat and disappear on skin. SAVA makes the most ordinary part of your
          morning feel considered.
        </p>

        <div
          data-reveal
          className="absolute bottom-gutter left-gutter hidden min-h-[clamp(16rem,42svh,24rem)] w-84 flex-col justify-between rounded-sm glass p-6 md:flex"
        >
          <p className="text-h4 uppercase">
            Dermatologist approved. <br />
            Made to ISO 22716.
          </p>
          <div>
            <hr className="border-t border-dotted border-paper/70" />
            <p className="mt-6 text-right text-body-lg">The most considered stick you&rsquo;ll ever twist.</p>
          </div>
        </div>

        <p
          aria-hidden="true"
          className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 text-kicker whitespace-nowrap"
        >
          <span className="center size-8 rounded-full border border-paper/60">
            <RiArrowDownSLine className="size-4" />
          </span>
          Scroll to continue
        </p>

        <VideoTile
          src={experienceMedia.film}
          label="the SAVA film"
          className="absolute right-gutter bottom-gutter hidden aspect-16/10 w-52 md:block"
        />
      </div>

      {/* The stick's first stop: lying across the table, label up */}
      <div
        data-stick="hero"
        data-stick-tilt="-58"
        data-stick-shadow="1"
        data-stick-drag
        className="pointer-events-none absolute top-[52%] left-1/2 aspect-1122/1402 h-[min(36svh,26rem)] -translate-1/2 touch-pan-y md:top-[60%] md:left-[45%] md:h-[min(50svh,34rem)] model-ready:pointer-events-auto model-ready:cursor-grab model-ready:active:cursor-grabbing"
      >
        <Image
          src={experienceMedia.stick}
          alt=""
          fill
          sizes="30rem"
          className="-rotate-58 object-contain drop-shadow-2xl model-ready:invisible"
        />
      </div>
    </section>
  );
}
