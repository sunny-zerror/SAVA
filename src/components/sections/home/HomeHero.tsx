import Image from "next/image";
import { Frame } from "@/components/ui/Frame";
import { siteConfig } from "@/config/site";
import { getProduct } from "@/services/catalog";
import { formatPrice } from "@/utils/format";
import { displayPrice } from "@/utils/product";
import HeroAddToCart from "./HeroAddToCart";
import HeroCanvas from "./HeroCanvas";
import HeroMotion from "./HeroMotion";
import HomeIntro from "./HomeIntro";
import StickBadge from "./StickBadge";

const highlights = [
  {
    icon: { src: "/icons/home/drop.svg", width: 17, height: 22 },
    title: "Advanced sweat control",
    text: "Stays fresh through every move, every commute, and everything in between.",
  },
  {
    icon: { src: "/icons/home/shield.svg", width: 18, height: 21 },
    title: "ISO 22716 certified",
    text: "Made to cosmetic GMP standards with traceable batches.",
  },
];

export default async function HomeHero() {
  const product = await getProduct(siteConfig.featuredProductSlug);

  return (
    <>
      {/* Outside the section: its isolate would trap the curtain under the sticky header */}
      <HomeIntro />
      {/* Pulled up under the absolute announcement bar and the sticky header (transparent over the hero until it pins) */}
      <HeroMotion
        aria-labelledby="home-hero"
        className="relative isolate -mt-[calc(var(--spacing-header)+var(--spacing-announcement))] overflow-hidden bg-gradient-brand text-paper"
      >
        {/* Brand-blue gradient paints first (and stays for reduced motion / no WebGL); the live shader fades in over it */}
        <HeroCanvas className="absolute inset-0 -z-10 size-full" />

        {/* Exactly one screen tall on every device (svh: the visible area, below a phone's URL bar),
            growing only if a very short screen can't fit the headline. Top padding clears the bar and
            header that overlay this section. */}
        <Frame
          tone="dark"
          className="flex h-svh min-h-fit flex-col pt-[calc(var(--spacing-header)+var(--spacing-announcement))] pb-12 md:pb-16"
        >
          {/* The stick at the top, the headline at the foot, so the stick never covers the lines */}
          <div className="flex flex-1 flex-col items-center justify-between gap-6 py-6">
            {/* Slot for the 3D model (HomeModel): same box as the stick, unrotated — the model takes the
                tilt. Sized off the screen's height so stick and headline share one screen */}
            <div
              data-model-anchor="hero"
              data-model-tilt="-19.71"
              data-model-fit="0.8"
              data-model-drag
              className="pointer-events-none aspect-[1122/1402] h-[clamp(14rem,40svh,34rem)] touch-pan-y model-ready:pointer-events-auto model-ready:cursor-grab model-ready:active:cursor-grabbing"
            />
            {/* data-heading-effect="intro": the lines rise once the intro clears, not on scroll */}
            <h1 id="home-hero" data-heading-effect="intro" className="text-center text-hero uppercase">
              <span data-heading-line className="block">
                Own Your
              </span>
              <span data-heading-line className="block">
                Movement
              </span>
            </h1>
          </div>
        </Frame>
      </HeroMotion>
    </>
  );
}
