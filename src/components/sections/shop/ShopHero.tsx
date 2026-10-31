import { RiShoppingBag3Line } from "@remixicon/react";
import BlobButton from "@/components/ui/BlobButton";
import { Frame } from "@/components/ui/Frame";
import ShopHeroMotion from "./ShopHeroMotion";

/**
 * The shop page's hero: a full-width 22:9 banner with the listing film looping silently
 * behind it, and over it, on the left, the headline and a Shop Now button. `id` on the products
 * listing below is the button's target.
 */
export default function ShopHero({ productsId }: { productsId: string }) {
  return (
    <ShopHeroMotion aria-labelledby="shop-hero" className="relative aspect-22/9 overflow-hidden bg-ink">
      <video
        src="/videos/listing_hero_video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      {/* The film is dark, products centred: a wash from the left keeps the headline legible */}
      <div aria-hidden="true" className="absolute inset-0 bg-linear-to-r from-ink/70 via-ink/30 to-transparent" />

      {/* Grid: the frame's container stretches to the banner's height, rails running top to bottom */}
      <div className="relative grid h-full">
        <Frame tone="dark" className="flex h-full items-center px-inset">
          <div className="flex flex-col items-start gap-8 text-paper">
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
        </Frame>
      </div>
    </ShopHeroMotion>
  );
}
