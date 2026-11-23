import Image from "next/image";
import { Frame } from "@/components/ui/Frame";
import SectionHeading from "@/components/ui/SectionHeading";
import FooterDroplets from "@/components/layout/FooterDroplets";

const card = "group relative isolate h-[26rem] overflow-hidden rounded-2xl md:h-auto md:min-h-[28rem]";
// Cards lift a little on hover; their photos settle in from a slight zoom
const lift = "transition-transform duration-700 ease-out-expo hover:-translate-y-2";
const zoom = "object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-105";

/**
 * Who it's for: three moments of a day on cards laid over the runner photo. The cards rise in one after
 * another; on hover each lifts and its photo slowly zooms, the middle card's portrait swells in its ring,
 * and its water beads wobble under the pointer.
 */
export default function AboutAudience() {
  return (
    <section aria-labelledby="about-audience" data-reveal-replay className="relative isolate overflow-hidden">
      <Image
        src="/images/about/who_its_for_bg_img.jpg"
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />

      <Frame tone="dark">
        <SectionHeading
          id="about-audience"
          tone="dark"
          eyebrow="Who it's for"
          title={
            <>
              Confidence Through
              <br />
              Every Season
            </>
          }
          className="px-inset pt-section"
        />

        {/* Room for the runner, who leaps between the heading and the cards */}
        <div aria-hidden="true" className="h-[min(32rem,58vw)]" />

        <ul data-reveal="stagger" className="grid gap-grid px-inset pb-section md:grid-cols-3">
          {/* Morning: photo card, label up top, copy over a dark fade at the foot */}
          <li className={lift}>
            <article className={`${card} flex flex-col justify-between p-5 text-paper`}>
              <Image
                src="/images/about/confidence_img_1.png"
                alt="Sweat on a runner's neck and collarbone after a morning run"
                fill
                sizes="(min-width: 48rem) 30vw, 100vw"
                className={`-z-10 ${zoom}`}
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-linear-to-t from-ink/85 via-ink/20 to-transparent"
              />
              <span className="w-fit rounded-full border border-paper/70 bg-ink/15 px-3 py-1 text-caption backdrop-blur-sm">
                Morning Movement
              </span>
              <div className="flex flex-col gap-2">
                <h3 className="text-h5">The 7am Run</h3>
                <p className="text-caption text-paper/85">
                  An early start, a clear mind, and a body ready to move. SAVA keeps you feeling fresh and confident
                  through every step of your morning routine.
                </p>
              </div>
            </article>
          </li>

          {/* Day: white card beaded with water, the wordmark, a portrait in a ring on a hairline */}
          <li className={lift}>
            <article className={`${card} flex flex-col items-center justify-between bg-paper p-5 text-ink`}>
              {/* Live beads of water (the footer's): they wobble as the pointer passes and now and then run down */}
              <FooterDroplets className="absolute inset-0 -z-10 size-full" />
              <div className="flex flex-col items-center gap-5 pt-2">
                <span
                  aria-hidden="true"
                  className="h-6 w-31 bg-ink mask-[url(/images/brand/wordmark.png)] mask-contain mask-center mask-no-repeat"
                />
                <h3 className="text-h6">Back-to-Back Meetings</h3>
              </div>
              <div className="relative flex w-full items-center justify-center">
                <span aria-hidden="true" className="absolute inset-x-6 top-1/2 h-px bg-rule" />
                <div className="relative size-28 overflow-hidden rounded-full border-4 border-paper bg-surface shadow-lg shadow-navy/15 transition-transform duration-700 ease-out-expo group-hover:scale-110">
                  <Image
                    src="/images/about/confidence_img_2.png"
                    alt="A hand at a lab bench, measuring out a formula"
                    fill
                    sizes="7rem"
                    className="object-cover"
                  />
                </div>
              </div>
              <p className="self-start text-caption text-muted">
                A busy schedule and no time to slow down. SAVA keeps you fresh, comfortable, and confident throughout.
              </p>
            </article>
          </li>

          {/* Evening: copy and tags on white up top, the photo filling the rest */}
          <li className={lift}>
            <article className={`${card} flex flex-col bg-paper text-ink`}>
              <div className="flex flex-col gap-3 p-5">
                <h3 className="text-h6">The Evening Out</h3>
                <p className="text-caption text-muted">
                  SAVA supports your dinner plans and hangouts, keeping you fresh and confident to enjoy every moment
                  without sweat worries.
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {["Fresh Vibes", "Endless Nights"].map((tag) => (
                    <li key={tag} className="rounded-full border border-line px-4 py-1.5 text-caption">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative min-h-40 flex-1 overflow-hidden">
                <Image
                  src="/images/about/confidence_img_3.png"
                  alt="Water drops on a swimmer's shoulder beside a red swimsuit strap"
                  fill
                  sizes="(min-width: 48rem) 30vw, 100vw"
                  className={zoom}
                />
              </div>
            </article>
          </li>
        </ul>
      </Frame>
    </section>
  );
}
