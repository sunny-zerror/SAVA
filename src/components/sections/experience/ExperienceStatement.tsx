import Image from "next/image";
import { cn } from "@/utils/cn";
import { experienceMedia } from "./media";
import ScrollTrack from "./ScrollTrack";

// A step's text: rises in while its step is on (ScrollTrack sets data-active)
const step =
  "translate-y-8 opacity-0 transition-[opacity,translate] duration-700 ease-out-expo data-active:translate-y-0 data-active:opacity-100";

/**
 * The statement, pinned: the stick stands up off the table and becomes the sentence's subject —
 * "[SAVA] isn't just a deodorant." — then swings across for the punchline, "Powered by Al*".
 */
export default function ExperienceStatement() {
  return (
    <ScrollTrack steps={2} aria-labelledby="experience-statement" data-chapter="Overview" className="h-[240svh]">
      <div className="sticky top-0 h-svh overflow-hidden bg-[radial-gradient(ellipse_at_40%_50%,var(--color-mist),var(--color-paper)_70%)]">
        <div className="relative container h-full">
          {/* Keyframes: upright and facing you, then across to the right for the second line */}
          <div
            data-stick="statement"
            data-stick-at="0.15"
            data-stick-turn="1"
            className="absolute top-[30%] left-1/2 aspect-1122/1402 h-[min(40svh,26rem)] -translate-1/2 md:top-1/2 md:left-[30%] md:h-[min(62svh,40rem)]"
          >
            <Image
              src={experienceMedia.stick}
              alt=""
              fill
              sizes="(min-width: 48rem) 32rem, 60vw"
              className="object-contain model-ready:invisible"
            />
          </div>
          <div
            aria-hidden="true"
            data-stick="statement-al"
            data-stick-at="0.8"
            data-stick-turn="2"
            data-stick-tilt="9"
            className="absolute top-[30%] left-1/2 aspect-1122/1402 h-[min(40svh,26rem)] -translate-1/2 md:top-[52%] md:left-[74%] md:h-[min(56svh,36rem)]"
          />

          <div
            data-step-of="0"
            data-active
            className={cn(
              "absolute inset-x-gutter top-[55%] md:inset-y-0 md:right-gutter md:left-[50%] md:flex md:flex-col md:justify-center",
              step,
            )}
          >
            <h2 id="experience-statement" className="text-h1">
              <span className="sr-only">SAVA </span>isn&rsquo;t just <br />a deodorant.
            </h2>
            <p className="mt-6 max-w-md text-body-lg text-muted">
              It&rsquo;s a sweat-control formula, a fragrance system and a pack shaped around your hand — tested on 120
              patients&rsquo; skin before it ever reached yours.
            </p>
          </div>

          <div
            data-step-of="1"
            className={cn(
              "absolute inset-x-gutter top-[55%] md:inset-y-0 md:right-auto md:flex md:w-[52%] md:flex-col md:justify-center",
              step,
            )}
          >
            <p className="text-hero">
              Powered <br />
              by Al<span className="text-accent">*</span>
            </p>
            <p className="mt-6 max-w-sm text-caption text-muted">
              * Aluminium salts — the active that plugs sweat at the duct. Not artificial intelligence.
            </p>
          </div>
        </div>
      </div>
    </ScrollTrack>
  );
}
