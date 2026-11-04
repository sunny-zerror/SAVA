import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/product/AddToCartButton";
import WishlistButton from "@/components/product/WishlistButton";
import Price from "@/components/ui/Price";
import { productPickers } from "@/config/shop";
import { productContent } from "@/data/product-content";
import type { ProductSummary } from "@/types";
import { cn } from "@/utils/cn";
import { stickVariantFor } from "@/lib/sava-stick";
import { mediaUrl, primaryImage } from "@/utils/media";
import { cardVariant, displayPrice, isOutOfStock, isSoldOut } from "@/utils/product";
import { productHref } from "@/utils/url";

interface ShopProductCardProps {
  product: ProductSummary;
  /** true for the first row on a page — loads the image eagerly for LCP */
  priority?: boolean;
}

const sizes = "(min-width: 64rem) 24vw, (min-width: 48rem) 30vw, 50vw";

/**
 * A cell of the shop listing. Over the photo: a badge (the discount, else the ribbon) and the
 * wishlist heart. Products with a 3D stick show it in place of the photo once live (ShopGridModel, in
 * the shop grid); hovering the card spins it round. Then the name, the scent and size, and the price
 * and Add To Cart for the variant the card sells (cardVariant).
 */
export default function ShopProductCard({ product, priority }: ShopProductCardProps) {
  const image = primaryImage(product.assets);
  const stick = stickVariantFor(product.slug);
  const variant = cardVariant(product);
  const soldOut = variant ? isOutOfStock(variant) : isSoldOut(product);

  const listed = variant?.variantPrice || displayPrice(product).price;
  const sale = product.discountedPrice && product.discountedPrice < listed ? product.discountedPrice : null;
  const badge = sale ? `${Math.round((1 - sale / listed) * 100)}% off` : product.ribbon?.name;

  const size = product.productOptions
    ?.find((o) => o.optionName === productPickers.size)
    ?.choices.find((c) => variant?.selectedOptions?.includes(c.name))?.name;
  const subtitle = [productContent[product.slug]?.scent, size && `(${size})`].filter(Boolean).join(" ");

  return (
    // group/card, named: BlobButton runs its own (unnamed) group hover, so the card's mustn't set it off
    <article data-grid-hover className="group/card relative flex flex-col gap-5 bg-paper p-4">
      {/* The 3D stick's slot (ShopGridModel), when the product has one */}
      <div
        data-grid-slot={stick ? "" : undefined}
        data-variant={stick ?? undefined}
        data-fit="0.72"
        className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface"
      >
        <Image
          src={mediaUrl(image?.path)}
          alt={image?.altText || product.name}
          fill
          sizes={sizes}
          priority={priority}
          // The shots are wide with the stick centred: cover trims the empty sides, scaled down for room
          // around it. multiply: their white backdrop takes the box's tint; the mask fades out the
          // reflection the shots cut off at their foot (the stick ends above 92%). Hidden once the 3D
          // stick is live; without it (reduced motion / no WebGL) the photo leans in a touch on hover
          className={cn(
            "scale-90 mask-b-from-92% object-cover mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover/card:scale-95",
            stick && "grid-model-ready:invisible",
          )}
        />
        {badge && (
          // A discount on blue; a ribbon ("Best Seller") on green, as on the product page
          <span
            className={cn(
              "absolute top-3 left-3 rounded-full px-3 py-1 text-caption",
              sale ? "bg-mist/70 backdrop-blur-sm" : "bg-mint",
            )}
          >
            {badge}
          </span>
        )}
        <WishlistButton productId={product._id} name={product.name} className="absolute top-3 right-3 z-10" />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h3 className="text-h5">
          {/* Stretched link: the card opens the product; the heart and the button sit above it */}
          <Link href={productHref(product.slug)} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        {subtitle && <p className="text-body text-muted">{subtitle}</p>}
      </div>

      {/* Price, then the button filling the rest of the row — once the card is wide enough for the blob
          to open beside the label (about 18rem), stacked below that */}
      <div className="@container mt-auto border-t border-line pt-4">
        <div className="flex flex-col gap-3 @[18.25rem]:flex-row @[18.25rem]:items-center">
          {/* justify-center only shows when stacked: beside the button the price is only as wide as itself */}
          <div className="flex shrink-0 items-baseline justify-center gap-1.5 text-body font-medium">
            <span>MRP</span>
            <Price price={sale ?? listed} compareAt={sale ? listed : null} />
          </div>
          <AddToCartButton
            slug={product.slug}
            productId={product._id}
            categoryId={product.categoryIds?.[0] ?? undefined}
            selectedOptions={variant?.selectedOptions ?? []}
            soldOut={soldOut}
            className="relative z-10"
          />
        </div>
      </div>
    </article>
  );
}
