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
      <HomeIntro />
      <HeroMotion
        aria-labelledby="home-hero"
        className="relative isolate -mt-[calc(var(--spacing-header)+var(--spacing-announcement))] overflow-hidden bg-gradient-brand text-paper"
      >
        <HeroCanvas className="absolute inset-0 -z-10 size-full" />

        <Frame
          tone="dark"
          className="flex h-svh min-h-fit flex-col pt-[calc(var(--spacing-header)+var(--spacing-announcement))]"
        >
          <div className="flex flex-1 flex-col items-center justify-between gap-6 py-6">
            <div
              data-model-anchor="hero"
              data-model-tilt="-19.71"
              data-model-fit="1"
              data-model-drag
              className="pointer-events-none aspect-[1122/1402] h-[clamp(17rem,52svh,46rem)] touch-pan-y model-ready:pointer-events-auto model-ready:cursor-grab model-ready:active:cursor-grabbing"
            />
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
