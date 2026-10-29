import Image from "next/image";
import Link from "next/link";
import Price from "@/components/ui/Price";
import type { ProductSummary } from "@/types";
import { hoverImage, mediaUrl, primaryImage } from "@/utils/media";
import { displayPrice, isSoldOut } from "@/utils/product";
import { productHref } from "@/utils/url";

interface ProductCardProps {
  product: ProductSummary;
  /** true for the first row on a page — loads the image eagerly for LCP */
  priority?: boolean;
}

export default function ProductCard({ product, priority }: ProductCardProps) {
  const main = primaryImage(product.assets);
  const hover = hoverImage(product.assets);
  const { price, compareAt } = displayPrice(product);
  const soldOut = isSoldOut(product);
  const sizes = "(min-width: 64rem) 25vw, (min-width: 48rem) 33vw, 50vw";

  return (
    <article className="group relative flex flex-col gap-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-surface">
        <Image
          src={mediaUrl(main?.path)}
          alt={main?.altText || product.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
        />
        {hover && hover.path !== main?.path && (
          <Image
            src={mediaUrl(hover.path)}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}
        {(product.ribbon?.name || soldOut) && (
          <span className="absolute top-3 left-3 bg-paper px-2 py-1 text-eyebrow">
            {soldOut ? "Sold out" : product.ribbon?.name}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <h3 className="font-secondary text-body">
          {/* Stretched link: the whole card is clickable, one link for screen readers */}
          <Link href={productHref(product.slug)} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <Price price={price} compareAt={compareAt} className="text-caption" />
      </div>
    </article>
  );
}
