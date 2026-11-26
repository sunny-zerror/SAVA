import Image from "next/image";
import Link from "next/link";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Price from "@/components/ui/Price";
import SectionHeading from "@/components/ui/SectionHeading";
import { stickVariantFor } from "@/lib/sava-stick";
import { getProducts } from "@/services/catalog";
import type { ProductSummary } from "@/types";
import { cn } from "@/utils/cn";
import { mediaUrl, primaryImage } from "@/utils/media";
import { displayPrice } from "@/utils/product";
import { productHref } from "@/utils/url";
import { stickCutoutFor } from "./cabinet-scene";

/** The stick that flies out of the cabinet (CabinetTraveller) lands in this product's card, in the middle */
const HERO_SLUG = "sava-balanced";

/** Three bestsellers, the hero stick's product between the other two */
async function getBestsellers() {
  const { products } = await getProducts({ limit: 6 });
  const hero = products.find((p) => p.slug === HERO_SLUG);
  const others = products.filter((p) => p !== hero);
  if (!hero) return { products: others.slice(0, 3), hero };
  return { products: [others[0], hero, others[1]].filter((p): p is ProductSummary => !!p), hero };
}

/**
 * The /home1 bestsellers, scrolling up over the blue the hero ends on (CabinetBackdrop). The stick
 * from the cabinet comes down into the middle card as it's centred (CabinetTraveller), between sticks
 * of the other two ranges.
 */
export default async function CabinetBestsellers() {
  const { products, hero } = await getBestsellers();
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="home1-bestsellers" className="relative text-paper">
      <Frame tone="dark" className="pb-section">
        <FrameRule tone="dark" />
        <SectionHeading
          id="home1-bestsellers"
          tone="dark"
          eyebrow="Our bestsellers"
          title="Advanced Formulations for Lasting Fragrance"
          className="px-inset py-10"
        />
        <FrameRule tone="dark" />

        {/* Cards rise in one by one. Only a rise, never a clip: the 3D sticks are drawn over their slots
            by CabinetTraveller's canvas, which follows the slots' moving rects but can't be clipped */}
        <ul
          data-reveal="stagger"
          className="grid gap-x-grid gap-y-12 px-inset pt-12 sm:grid-cols-3 sm:items-end lg:gap-x-11"
        >
          {products.map((product) => (
            <li key={product._id} className="max-sm:mx-auto max-sm:w-full max-sm:max-w-xs">
              {/* The hero stick's card stands taller */}
              <BestsellerCard product={product} featured={product === hero} />
            </li>
          ))}
        </ul>
      </Frame>
    </section>
  );
}

function BestsellerCard({ product, featured }: { product: ProductSummary; featured: boolean }) {
  const { price, compareAt } = displayPrice(product);
  // A 3D stick (CabinetTraveller) stands in for the photo once it's live
  const variant = stickVariantFor(product.slug);
  // The stick on transparency where there is one, to stand on the blue; the product photo otherwise
  const cutout = stickCutoutFor(product.slug);
  const image = primaryImage(product.assets);

  return (
    // data-model-hover: hovering the card turns its stick
    <article data-model-hover className="group relative flex flex-col items-center gap-6 text-center">
      {/* The featured card is where the travelling stick lands; the others hold sticks of their own */}
      <div
        data-model-anchor={featured ? "bestseller" : undefined}
        data-model-static={!featured && variant ? "" : undefined}
        data-model-variant={variant ?? undefined}
        data-model-fit="0.86"
        className={cn("relative w-full", featured ? "aspect-[379/493]" : "aspect-[4/5]")}
      >
        <Image
          src={cutout ?? mediaUrl(image?.path)}
          alt={image?.altText || product.name}
          fill
          sizes="(min-width: 40rem) 33vw, 100vw"
          className={cn(cutout ? "scale-86 object-contain" : "object-cover", variant && "model-ready:opacity-0")}
        />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <h3 className="text-h5">
          {/* Stretched link: the whole card is clickable, one link for screen readers */}
          <Link href={productHref(product.slug)} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-baseline gap-1.5 text-body-lg text-paper/85">
          <span>MRP</span>
          <Price price={price} compareAt={compareAt} />
        </div>
      </div>
    </article>
  );
}
