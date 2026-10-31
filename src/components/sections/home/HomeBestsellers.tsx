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

export default async function HomeBestsellers() {
  const { products } = await getProducts({ limit: 3 });
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="home-bestsellers">
      <Frame className="pb-section">
        <FrameRule />
        <SectionHeading
          id="home-bestsellers"
          eyebrow="Our bestsellers"
          title="Advanced Formulations for Lasting Fragrance"
          className="px-inset py-10"
        />
        <FrameRule />

        <ul className="grid gap-x-grid gap-y-12 px-inset pt-12 sm:grid-cols-3 sm:items-end lg:gap-x-11">
          {products.map((product, i) => (
            <li key={product._id} className="max-sm:mx-auto max-sm:w-full max-sm:max-w-xs">
              {/* The middle product stands taller */}
              <BestsellerCard product={product} featured={i === 1} />
            </li>
          ))}
        </ul>
      </Frame>
    </section>
  );
}

function BestsellerCard({ product, featured }: { product: ProductSummary; featured: boolean }) {
  const image = primaryImage(product.assets);
  const { price, compareAt } = displayPrice(product);
  // Products with a 3D stick (HomeModel) show it in place of their photo once it's live
  const variant = stickVariantFor(product.slug);

  return (
    // data-model-hover: hovering the card spins its stick
    <article data-model-hover className="group relative flex flex-col items-center text-center">
      {/* The featured card is a stop for the travelling stick; the others hold sticks of their own */}
      <div
        data-model-anchor={featured ? "bestseller" : undefined}
        data-model-static={!featured && variant ? "" : undefined}
        data-model-variant={variant ?? undefined}
        data-model-fit={featured ? 0.78 : 0.79}
        className={cn("relative w-full overflow-hidden", featured ? "aspect-[379/493]" : "aspect-[4/5]")}
      >
        <Image
          src={mediaUrl(image?.path)}
          alt={image?.altText || product.name}
          fill
          sizes="(min-width: 40rem) 33vw, 100vw"
          className={cn(
            "object-cover transition-transform duration-700 ease-out-expo",
            featured ? "scale-120 group-hover:scale-125" : "group-hover:scale-[1.03]",
            (featured || variant) && "model-ready:opacity-0",
          )}
        />
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <h3 className="text-h5">
          {/* Stretched link: the whole card is clickable, one link for screen readers */}
          <Link href={productHref(product.slug)} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <div className="flex items-baseline gap-1.5 text-body-lg text-muted">
          <span>MRP</span>
          <Price price={price} compareAt={compareAt} />
        </div>
      </div>
    </article>
  );
}
