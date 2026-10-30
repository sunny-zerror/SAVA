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

        {/* Top padding clears the bar and header that overlay this section */}
        <Frame
          tone="dark"
          className="flex min-h-[min(100svh,58.75rem)] flex-col pt-[calc(var(--spacing-header)+var(--spacing-announcement))] pb-12 md:pb-24"
        >
          <div className="relative grid flex-1 place-items-center py-16">
            {/* data-heading-effect="intro": the lines rise once the intro clears, not on scroll */}
            <h1 id="home-hero" data-heading-effect="intro" className="text-center text-display uppercase">
              <span data-heading-line className="block">
                Own Your
              </span>
              <span data-heading-line className="block">
                Movement
              </span>
            </h1>
            {/* Slot for the 3D model (HomeModel): same box as the stick, unrotated — the model takes the tilt */}
            <div
              data-model-anchor="hero"
              data-model-tilt="-19.71"
              data-model-fit="0.8"
              data-model-drag
              className="pointer-events-none absolute top-1/2 left-1/2 aspect-[1122/1402] w-[clamp(11rem,33vw,29.5rem)] -translate-1/2 touch-pan-y model-ready:pointer-events-auto model-ready:cursor-grab model-ready:active:cursor-grabbing"
            />
          </div>
        </Frame>
      </HeroMotion>
    </>
  );
}
