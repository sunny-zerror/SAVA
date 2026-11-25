import Image from "next/image";
import BlobButton from "@/components/ui/BlobButton";
import { Frame } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { productContent } from "@/data/product-content";
import { productHref } from "@/utils/url";
import CabinetScene from "./CabinetScene";
import CabinetScroll from "./CabinetScroll";
import CabinetTraveller from "./CabinetTraveller";
import { HAND } from "./cabinet-scene";

const pct = ({ left, top, width, height }: { left: number; top: number; width: number; height: number }) => ({
  left: `${left}%`,
  top: `${top}%`,
  width: `${width}%`,
  height: `${height}%`,
});

const balanced = productContent["sava-balanced"];

/**
 * The /home1 opening: the bathroom cabinet on its blue panelled wall (CabinetScene), SAVA's sticks on
 * its shelves, and the heading on the wall beside it. Scrolling plays the scene in CabinetScroll: the
 * copy lifts away, the Balanced stick flips out of the cabinet into an open hand in the middle of the
 * screen (CabinetTraveller) as the room fades to white, and its name comes in around it.
 *
 * The scene scales by --s, screen px per pixel of the original photo: on large screens the photo fills
 * the height below the header, the cabinet's middle at 57% across so the copy has the wall to its left;
 * on smaller ones the cabinet takes the width (up to 30rem) under the copy, with the photo's own
 * height left for it below.
 */
export default function CabinetHero() {
  return (
    <>
      <CabinetScroll
        aria-labelledby="home1-hero"
        className="relative isolate -mt-[calc(var(--spacing-header)+var(--spacing-announcement))] overflow-hidden bg-paper text-paper [--cx:50%] [--s:calc(min(92vw,30rem)/569)] lg:h-svh lg:min-h-152 lg:[--cx:57%] lg:[--s:calc((max(100svh,38rem)-var(--spacing-header)-var(--spacing-announcement))/941)]"
      >
        <CabinetScene />

        {/* Shade under the header, and on large screens behind the copy, so white type reads on the blue */}
        <div
          aria-hidden="true"
          data-cabinet-fade
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-linear-to-b from-navy/40 to-transparent"
        />
        <div
          aria-hidden="true"
          data-cabinet-fade
          className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 bg-linear-to-r from-navy/40 via-navy/10 to-transparent lg:block"
        />

        <div className="relative lg:pointer-events-none lg:absolute lg:inset-0">
          <Frame
            tone="dark"
            className="flex flex-col pt-[calc(var(--spacing-header)+var(--spacing-announcement))] lg:h-svh lg:min-h-152 lg:justify-center"
          >
            <div
              data-cabinet-copy
              className="max-w-md px-inset pt-8 pb-10 lg:pointer-events-auto lg:max-w-xs lg:py-0 xl:max-w-md"
            >
              <p className="flex items-center gap-2 text-kicker">
                <Sparkle />
                The Sava cabinet
              </p>
              <h1 id="home1-hero" className="mt-5 uppercase">
                Own your movement
              </h1>
              <p className="mt-5 text-body-lg">
                Sweat control and refined fragrance, stocked and ready. Open the doors and pick yours.
              </p>
              <BlobButton href="/shop" tone="light" className="mt-8">
                Shop the range
              </BlobButton>
              <p className="mt-6 text-micro uppercase opacity-80 pointer-coarse:hidden">
                Move across the cabinet to open it
              </p>
              <p className="mt-6 hidden text-micro uppercase opacity-80 pointer-coarse:block">Tap a door to open it</p>
            </div>

            {/* Below the copy on smaller screens: the photo's height, for the cabinet to stand in */}
            <div aria-hidden="true" className="h-[calc(var(--s)*941)] lg:hidden" />
          </Frame>
        </div>

        {/* Where the scroll scene ends, in the section's last screenful (all of it on large screens):
            the hand in the middle, the stick's name above it. Hidden until the scene brings it in */}
        <div
          data-cabinet-end
          className="pointer-events-none invisible absolute inset-x-0 bottom-0 h-svh text-ink motion-reduce:hidden"
        >
          {/* Where the stick lands, just below the middle, and the 3D hand rises to hold it
              (CabinetTraveller). Wider than the stick, so its height sets its size */}
          <div
            data-model-anchor="palm"
            className="absolute top-[52%] left-1/2 h-[31svh] w-[25svh] -translate-x-1/2 -translate-y-1/2"
          />
          {/* Hovering here (the stick and the hand under it) lifts them */}
          <div
            data-cabinet-grip
            aria-hidden="true"
            className="pointer-events-auto absolute top-[28%] bottom-0 left-1/2 w-[min(60svh,80vw)] -translate-x-1/2"
          />

          {/* Without WebGL: the photo of the hand holding the stick, its stick's slot in the middle */}
          <div
            data-cabinet-hand
            className="invisible absolute top-[55%] left-1/2 aspect-1460/1350 h-[min(76svh,calc(92vw*1350/1460))] translate-x-[-54.5%] translate-y-[-36.75%] model-ready:hidden"
          >
            <Image
              src="/images/home/features-hand.png"
              alt="An open hand holding the SAVA Balanced stick"
              fill
              sizes="(min-width: 64rem) 50vw, 92vw"
            />
            <span
              aria-hidden="true"
              className="absolute bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-ink)_45%,transparent),transparent)] blur-[3px]"
              style={pct(HAND.shadow)}
            />
            <Image src="/images/home/features-stick.png" alt="" fill sizes="(min-width: 64rem) 50vw, 92vw" />
          </div>

          <Frame className="flex h-svh flex-col justify-between pt-[calc(var(--spacing-header)+1.5rem)] pb-24">
            <div data-cabinet-outro className="invisible px-inset text-center">
              <h2 className="text-hero uppercase">Sava Balanced</h2>
              <p className="mt-3 text-h5 text-accent">{balanced.scent}</p>
            </div>
            <div className="flex items-end justify-between gap-6 px-inset">
              <div data-cabinet-outro className="pointer-events-auto invisible flex flex-col items-start gap-4">
                <BlobButton href={productHref("sava-balanced")}>Shop Balanced</BlobButton>
                <p className="text-micro text-muted uppercase pointer-coarse:hidden">Hover the hand</p>
                <p className="hidden text-micro text-muted uppercase pointer-coarse:block">Tap the hand</p>
              </div>
              <p data-cabinet-outro className="invisible text-right text-h5 uppercase max-sm:hidden">
                {balanced.tagline.split(". ").map((line) => (
                  <span key={line} className="block">
                    {line.replace(/\.$/, "")}.
                  </span>
                ))}
                <span className="block">Own your movement.</span>
              </p>
            </div>
          </Frame>
        </div>
      </CabinetScroll>
      <CabinetTraveller />
    </>
  );
}
