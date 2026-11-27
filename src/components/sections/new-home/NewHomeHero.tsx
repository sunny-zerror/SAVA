import Image from "next/image";
import { Frame } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import HeroScroll from "./HeroScroll";
import HeroStick from "./HeroStick";

/*
 * The photo's own box, sized like object-cover (it always fills the viewport-tall hero), so the stick's
 * slot — placed in % of the photo — stays on the bench between the towel and the shaker at any size.
 * Portrait phones shift it so that gap (71.1% across) sits mid-screen instead of the photo's centre.
 */
const PHOTO = { width: 1774, height: 887 };

/*
 * The story's hairlines, laid over the frame's border like Frame's own rails: the two outer ones
 * (data-story-rail) take over from the photo's frame rails as it fades, the two column dividers
 * (data-story-rule) draw down after.
 */
const RAILS = ["-left-px", "-right-px"];
const RULES = ["left-1/3", "left-2/3"];

/**
 * The /home opening: the gym photo with the 3D stick on the bench, then — pinned while you scroll
 * (HeroScroll) — the photo fades out to white, the stick travels to the centre and the SAVA story
 * comes in from both sides. With reduced motion nothing pins: the story simply follows the photo.
 */
export default function NewHomeHero() {
  return (
    <>
      <HeroScroll aria-labelledby="new-home-hero" className="relative isolate -mt-header bg-paper">
        <div data-hero-photo className="relative overflow-hidden text-paper">
          <div className="absolute top-1/2 left-1/2 -z-10 aspect-[1774/887] w-[max(100%,calc(100svh*1774/887))] -translate-x-1/2 -translate-y-1/2 max-md:portrait:-translate-x-[71.1%]">
            <Image
              src="/images/newhome/hero_bg.png"
              alt=""
              width={PHOTO.width}
              height={PHOTO.height}
              priority
              sizes="max(100vw, 200vh)"
              className="size-full object-cover"
            />

            {/* Where the 3D stick stands: its base on the bench at the shaker's depth (photo y 629 of 887),
              about two-thirds of the shaker's height */}
            <div
              data-model-anchor="bench"
              className="pointer-events-none absolute top-[59.4%] left-[68.2%] h-[11.5%] w-[8%]"
            >
              {/* Contact shadow on the leather — HeroStick grows it in as the stick lands */}
              <span
                aria-hidden="true"
                data-stick-shadow
                className="absolute bottom-0 left-1/2 h-[9%] w-[70%] -translate-x-1/2 translate-y-1/3 rounded-[50%] bg-ink/80 opacity-0 blur-md"
              />
            </div>
          </div>

          {/* Darkens the top (header) and left (heading) so the type reads over the bright windows */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 -z-10 h-1/4 bg-linear-to-b from-ink/50 to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 -z-10 w-2/3 bg-linear-to-r from-ink/60 via-ink/20 to-transparent"
          />

          {/* The frame's rails run the full height, up through the transparent header, as on "/" */}
          <Frame tone="dark" className="flex h-svh min-h-fit flex-col pt-header">
            {/* Vertically centred in the space below the header, inset from the rail like the header's menu */}
            <div data-hero-heading className="flex flex-1 flex-col justify-center px-inset">
              {/* Lines rise in once the page has settled (data-heading-effect, src/lib/global.ts) */}
              <h1 id="new-home-hero" data-heading-effect="intro" className="text-hero uppercase">
                <span data-heading-line className="block">
                  Own Your
                </span>
                <span data-heading-line className="block">
                  Movement
                </span>
              </h1>
            </div>
          </Frame>
        </div>

        {/* The story, laid over the photo for the pinned scroll (hidden until HeroScroll brings it in);
          below it, in the page's flow, with reduced motion */}
        <div
          aria-labelledby="new-home-story"
          className="absolute inset-x-0 top-0 h-svh min-h-fit text-ink motion-reduce:relative motion-reduce:h-auto motion-reduce:py-section"
        >
          {/* Same box as Frame's: inside the gutters, with a transparent border for the rails to cover */}
          <div className="container h-full">
            <div className="relative h-full border-x border-transparent">
              {RAILS.map((side) => (
                <span
                  key={side}
                  aria-hidden="true"
                  data-story-rail
                  className={`absolute inset-y-0 z-20 w-px bg-rule motion-safe:opacity-0 ${side}`}
                />
              ))}
              {RULES.map((side) => (
                <span
                  key={side}
                  aria-hidden="true"
                  data-story-rule
                  className={`absolute inset-y-0 hidden w-px origin-top bg-rule motion-safe:opacity-0 md:block ${side}`}
                />
              ))}

              <div className="flex h-full flex-col items-center justify-center gap-8 px-inset pt-header pb-10 text-center md:grid md:grid-cols-3 md:gap-0 md:px-0 md:text-left">
                <p data-story-text="left" className="max-w-sm text-body uppercase motion-safe:opacity-0 md:px-inset">
                  SAVA brings together advanced sweat-control technology and refined fragrance to create a new standard
                  in everyday personal care.
                </p>

                <div className="flex flex-col items-center">
                  <h2
                    id="new-home-story"
                    data-story-kicker
                    className="flex items-center gap-2 text-kicker text-accent motion-safe:opacity-0"
                  >
                    <Sparkle />
                    Sava Story
                  </h2>
                  {/* Where the stick ends up; a photo stands in when it doesn't travel (reduced motion) */}
                  <div
                    data-model-anchor="story"
                    className="relative mt-6 aspect-[1122/1402] h-[clamp(14rem,48svh,30rem)]"
                  >
                    <Image
                      src="/images/products/sava-balanced.jpg"
                      alt="SAVA Balanced deodorant stick"
                      fill
                      sizes="24rem"
                      className="hidden object-contain mix-blend-multiply motion-reduce:block"
                    />
                  </div>
                </div>

                <p
                  data-story-text="right"
                  className="max-w-sm text-body uppercase motion-safe:opacity-0 md:justify-self-end md:px-inset"
                >
                  Our advanced formulations are designed to provide dependable sweat control, long-lasting fragrance,
                  and all-day freshness.
                </p>
              </div>
            </div>
          </div>
        </div>
      </HeroScroll>
      {/* Outside the pinned section: the pin's transform would carry its fixed canvas off with it */}
      <HeroStick />
    </>
  );
}
