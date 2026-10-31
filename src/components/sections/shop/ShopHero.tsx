import { RiShoppingBag3Line } from "@remixicon/react";
import Image from "next/image";
import BlobButton from "@/components/ui/BlobButton";
import { Frame } from "@/components/ui/Frame";
import ShopHeroModel from "./ShopHeroModel";
import ShopHeroMotion from "./ShopHeroMotion";

/*
 * Where each stick stands on the stage, in % of the stage box — the still-life artwork, 1672 × 941.
 * Measured off it: the cylinder spans x 799–1017 and the cube 1040–1370, both topped at y ≈ 480;
 * the floor is y ≈ 663. Renewed and Kinetic stand centred on the blocks, 470px tall (≈ 2.1× the
 * block width, as in the reference shot); Balanced leans 25°, its lowest corner on the floor and
 * its top against Renewed's side. Heights set each stick's size.
 */
const slots = [
  { variant: "balanced", tilt: 25, style: { left: "29.3%", top: "17.5%", width: "15%", height: "51%" } },
  { variant: "renewed", style: { left: "47%", top: "1.5%", width: "14.6%", height: "49.9%" } },
  { variant: "kinetic", style: { left: "64.8%", top: "1.6%", width: "14.6%", height: "49.9%" } },
];

/**
 * The shop page's hero: the headline and a Shop Now button on the left; on the right a still life
 * of two wood blocks and a tote bag, onto which the three SAVA sticks drop and settle (ShopHeroModel).
 * `id` on the products listing below is the button's target.
 */
export default function ShopHero({ productsId }: { productsId: string }) {
  return (
    <ShopHeroMotion aria-labelledby="shop-hero" className="overflow-hidden bg-surface">
      {/* Framed between the page rails, like the rest of the site */}
      <Frame className="grid items-center gap-10 px-inset py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-6 lg:py-10">
        <div className="flex flex-col items-start gap-8">
          {/* Hand-made lines, revealed on load (not on scroll) like the home hero's headline */}
          <h1 id="shop-hero" data-heading-effect="intro" className="max-w-xl">
            <span data-heading-line className="block">
              Explore Signature
            </span>
            <span data-heading-line className="block">
              Fragrances
            </span>
          </h1>
          <div data-shop-intro>
            <BlobButton href={`#${productsId}`} icon={<RiShoppingBag3Line className="size-4" />}>
              Shop Now
            </BlobButton>
          </div>
        </div>

        {/* The tote bag runs off the artwork's right edge, so the stage bleeds to the window edge
            (clipped by the section) and the bag reads as running off the page, not cut short */}
        <div className="relative bleed-r aspect-1672/941">
          {/* Wood blocks and the tote bag (with their floor shadows) */}
          <Image
            src="/images/banners/shop-still-life.png"
            alt=""
            fill
            priority
            sizes="(min-width: 64rem) 65vw, 100vw"
            className="object-contain"
          />
          {/* The photo's own sticks: shown until the 3D ones are live, and for reduced motion / no WebGL */}
          {slots.map((slot) => (
            <div
              key={slot.variant}
              data-shop-slot
              data-variant={slot.variant}
              data-tilt={slot.tilt}
              style={slot.style}
              className="pointer-events-none absolute touch-pan-y shop-model-ready:pointer-events-auto shop-model-ready:cursor-grab shop-model-ready:active:cursor-grabbing"
            />
          ))}
        </div>
      </Frame>
      <ShopHeroModel />
    </ShopHeroMotion>
  );
}
