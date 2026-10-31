import Image from "next/image";
import Link from "next/link";
import BuyNowButton from "@/components/product/BuyNowButton";
import Price from "@/components/ui/Price";
import { stickVariantFor } from "@/lib/sava-stick";
import type { ProductSummary } from "@/types";
import { cn } from "@/utils/cn";
import { mediaUrl, primaryImage } from "@/utils/media";
import { displayPrice, isSoldOut } from "@/utils/product";
import { productHref } from "@/utils/url";

interface ShopProductCardProps {
  product: ProductSummary;
  /** true for the first row on a page — loads the image eagerly for LCP */
  priority?: boolean;
}

/**
 * A cell of the shop listing: name, product, price and Buy It Now, centred. Products with a 3D stick
 * show it in place of the photo once live (ShopGridModel); hovering the card spins it round.
 */
export default function ShopProductCard({ product, priority }: ShopProductCardProps) {
  const image = primaryImage(product.assets);
  const { price, compareAt } = displayPrice(product);
  const soldOut = isSoldOut(product);
  const variant = stickVariantFor(product.slug);

  return (
    <article
      data-grid-hover
      className="group relative flex flex-col items-center gap-4 bg-paper px-5 pt-6 pb-5 text-center md:px-7"
    >
      <h3 className="text-h5">
        {/* Stretched link: the card opens the product; the button sits above it */}
        <Link href={productHref(product.slug)} className="after:absolute after:inset-0">
          {product.name}
        </Link>
      </h3>
      <div
        data-grid-slot={variant ? "" : undefined}
        data-variant={variant ?? undefined}
        data-fit="0.92"
        className="relative aspect-square w-full max-w-60"
      >
        <Image
          src={mediaUrl(image?.path)}
          alt={image?.altText || product.name}
          fill
          sizes="(min-width: 64rem) 20vw, (min-width: 48rem) 30vw, 50vw"
          priority={priority}
          // multiply: the shots' near-white backdrop melts into the card
          className={cn(
            "object-contain mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover:scale-105",
            variant && "grid-model-ready:invisible",
          )}
        />
      </div>
      <Price price={price} compareAt={compareAt} className="text-body-lg" />
      <BuyNowButton
        slug={product.slug}
        productId={product._id}
        categoryId={product.categoryIds?.[0] ?? undefined}
        soldOut={soldOut}
        className="relative z-10 mt-auto"
      />
    </article>
  );
}
