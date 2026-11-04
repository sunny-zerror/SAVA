import { Frame } from "@/components/ui/Frame";

/** The shop page's hero: a full-width 22:9 banner with the listing film looping silently */
export default function ShopHero() {
  return (
    <section aria-labelledby="shop-hero" className="relative aspect-22/9 overflow-hidden bg-gray-100">
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

      {/* Grid: the frame's container stretches to the banner's height, rails running top to bottom */}
      <div className="relative grid h-full">
        <Frame tone="dark" className="h-full">
          {/* No visible headline over the film; the page's h1 stays for screen readers and search */}
          <h1 id="shop-hero" className="sr-only">
            Explore Signature Fragrances
          </h1>
        </Frame>
      </div>
    </section>
  );
}
