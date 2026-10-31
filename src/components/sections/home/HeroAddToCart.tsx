"use client";

import { RiShoppingBag3Line } from "@remixicon/react";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types";
import { isOutOfStock, toVariantDetail } from "@/utils/product";

const action = "group flex w-full items-center justify-between gap-4 text-cta disabled:opacity-60";

const icon = (
  <span
    aria-hidden="true"
    className="center size-7 rounded-full border border-paper/40 transition-colors group-hover:bg-paper group-hover:text-ink"
  >
    <RiShoppingBag3Line className="size-3.5" />
  </span>
);

/** Quick add for a single-variant product; products with options send shoppers to the shop instead */
export default function HeroAddToCart({ product }: { product: Product }) {
  const { addItem, busy } = useCart();
  const openCart = useCartStore((s) => s.open);
  const variant = (product.productOptions ?? []).length === 0 ? product.variants?.[0] : undefined;

  if (!variant) {
    return (
      <Link href="/shop" className={action}>
        Shop Now
        {icon}
      </Link>
    );
  }

  const soldOut = isOutOfStock(variant);
  const onAdd = async () => {
    const added = await addItem({
      productId: product._id,
      categoryId: product.categoryIds?.[0],
      variant: toVariantDetail(variant),
    });
    if (added) openCart();
  };

  return (
    <button type="button" onClick={onAdd} disabled={busy || soldOut} className={action}>
      {soldOut ? "Sold Out" : "Add To Cart"}
      {icon}
    </button>
  );
}
