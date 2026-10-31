import Image from "next/image";
import type { Asset } from "@/types";
import { mediaUrl, productImages } from "@/utils/media";

/** Swipeable strip on mobile, two-column stack on desktop — no JS needed */
export default function ProductGallery({ assets, name }: { assets: Asset[]; name: string }) {
  const images = productImages(assets);
  const list = images.length ? images : [{ path: "", altText: name }];

  return (
    <div className="-mx-gutter no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:mx-0 md:grid md:grid-cols-2 md:gap-2 md:overflow-visible">
      {list.map((image, i) => (
        <div
          key={`${image.path}-${i}`}
          // Plain photos (no 3D slot), so the later ones open from their foot as they scroll in. Not
          // the first: it's the page's LCP, above the fold, so it shows straight away
          data-reveal={i === 0 ? undefined : "image"}
          className="relative aspect-[3/4] w-full shrink-0 snap-start overflow-hidden bg-surface md:first:col-span-2"
        >
          <Image
            src={mediaUrl(image.path)}
            alt={image.altText || `${name} — image ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(min-width: 48rem) 60vw, 100vw"
            className="object-cover"
          />
        </div>
      ))}
    </div>
  );
}
