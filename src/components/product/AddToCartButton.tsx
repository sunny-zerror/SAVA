"use client";

import { RiShoppingBag3Line } from "@remixicon/react";
import BlobButton from "@/components/ui/BlobButton";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { productHref } from "@/utils/url";

interface AddToCartButtonProps {
  slug: string;
  productId: string;
  categoryId?: string;
  /** The choices of the variant the card shows ([] for a product without options) */
  selectedOptions: string[];
  soldOut?: boolean;
  className?: string;
}

/**
 * "Add To Cart" on a listing card — SAVA's BlobButton, full width. It's a real link to the product
 * (so it works before JS); the click adds the variant the card shows and opens the bag (useQuickAdd).
 */
export default function AddToCartButton({
  slug,
  productId,
  categoryId,
  selectedOptions,
  soldOut,
  className,
}: AddToCartButtonProps) {
  const { add, loading, busy } = useQuickAdd();

  return (
    <BlobButton
      href={productHref(slug)}
      block
      icon={<RiShoppingBag3Line className="size-4" />}
      aria-disabled={soldOut || undefined}
      onClick={(event) => {
        event.preventDefault();
        if (soldOut || busy || loading) return;
        void add({ slug, productId, categoryId, selectedOptions });
      }}
      className={className}
    >
      {soldOut ? "Sold Out" : loading ? "Adding…" : "Add To Cart"}
    </BlobButton>
  );
}
