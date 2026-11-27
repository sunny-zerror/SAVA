import Image from "next/image";
import BlobButton from "@/components/ui/BlobButton";
import { Frame } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { productContent } from "@/data/product-content";
import CabinetScene from "./CabinetScene";
import CabinetScroll from "./CabinetScroll";
import CabinetTraveller from "./CabinetTraveller";

const balanced = productContent["sava-balanced"];

/** The scroll scene's last frame: a heading beside the stick, and what it is beside that */
const HEADING = ["Isn't just", "a deodorant."];
const DESCRIPTION = `Sava Balanced isn't just a deodorant. It's advanced sweat control and ${balanced.scent}, in one stick made for India's heat.`;

/** Each word in a span of its own, for the scroll scene to fill in one after another (data-cabinet-word) */
function Words({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span data-cabinet-word>{word}</span>
    </span>
  ));
}

/**
 * The /home1 opening: the bathroom cabinet on its blue panelled wall (CabinetScene), SAVA's sticks on
 * its shelves, and the heading on the wall beside it. Scrolling plays the scene in CabinetScroll: the
 * copy lifts away, the Balanced stick leaves its shelf for the middle of the screen, turning once about
 * its upright axis (CabinetTraveller), as the room fades to show the sky-blue SAVA gradient behind the section
 * (CabinetBackdrop); a heading fills in to its left and a few lines to its right. Past it the
 * bestsellers scroll up over the same blue, and the stick comes down into the middle card.
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
        className="relative isolate overflow-hidden text-paper [--cx:50%] [--s:calc(min(92vw,30rem)/569)] lg:h-svh lg:min-h-152 lg:[--cx:57%] lg:[--s:calc((max(100svh,38rem)-var(--spacing-header))/941)]"
      >
        {/* The room's white, under the scene: the scroll scene fades it after the scene, down to the blue */}
        <div aria-hidden="true" data-cabinet-room className="absolute inset-0 bg-paper" />
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
          <Frame tone="dark" className="flex flex-col pt-header lg:h-svh lg:min-h-152 lg:justify-center">
            <div
              data-cabinet-copy
              className="max-w-md px-inset pt-8 pb-10 lg:pointer-events-auto lg:max-w-xs lg:py-0 xl:max-w-lg"
            >
              <h1 id="home1-hero" className="mt-5 font-bold uppercase">
                Own your movement
              </h1>
              <p className="mt-5 text-body-lg">
                Sweat control and refined fragrance, stocked and ready. Open the doors and pick yours.
              </p>
              <BlobButton href="/shop" tone="light" className="mt-8">
                Shop the range
              </BlobButton>
              <p className="mt-6 hidden text-micro uppercase opacity-80 pointer-coarse:block">Tap a door to open it</p>
            </div>

            {/* Below the copy on smaller screens: the photo's height, for the cabinet to stand in */}
            <div aria-hidden="true" className="h-[calc(var(--s)*941)] lg:hidden" />
          </Frame>
        </div>

        {/* Where the scroll scene ends, in the section's last screenful (all of it on large screens): the
            stick turned to face us in the middle of the sky-blue field, a heading to its left and its lines to its
            right, their words filling in as the scroll goes on. Hidden until the scene brings it in. It has
            no background: the blue is CabinetBackdrop's, held still behind it as the page scrolls on */}
        <div
          data-cabinet-end
          className="pointer-events-none invisible absolute inset-x-0 bottom-0 h-svh overflow-hidden motion-reduce:hidden"
        >
          {/* Where the stick lands, in the middle (CabinetTraveller); without WebGL its photo stands there */}
          <div
            data-model-anchor="spot"
            className="absolute top-1/2 left-1/2 h-[40svh] w-[22svh] -translate-x-1/2 -translate-y-1/2 lg:h-[58svh] lg:w-[30svh]"
          >
            <Image
              src="/images/newhome/sticks/sava-balanced-3d.webp"
              alt=""
              fill
              sizes="30svh"
              className="object-contain model-ready:hidden"
            />
          </div>

          {/* Heading over the stick and lines under it on phones; to its left and right on large screens */}
          <Frame
            tone="dark"
            className="grid h-svh grid-rows-[auto_1fr_auto] pt-[calc(var(--spacing-header)+1.5rem)] pb-14 lg:grid-cols-[1fr_32svh_1fr] lg:grid-rows-1 lg:items-center lg:py-0"
          >
            <h2 className="px-inset uppercase">
              {HEADING.map((line) => (
                <span key={line} className="block">
                  <Words text={line} />
                </span>
              ))}
            </h2>
            <div aria-hidden="true" />
            <p className="max-w-sm px-inset text-h5 lg:justify-self-end">
              <Words text={DESCRIPTION} />
            </p>
          </Frame>
        </div>
      </CabinetScroll>
      <CabinetTraveller />
    </>
  );
}
