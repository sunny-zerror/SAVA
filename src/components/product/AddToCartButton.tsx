"use client";

import { useApolloClient } from "@apollo/client/react";
import { RiShoppingBag3Line } from "@remixicon/react";
import { useState } from "react";
import BlobButton from "@/components/ui/BlobButton";
import { GET_PRODUCT } from "@/graphql";
import { useCart } from "@/hooks/useCart";
import { isApiConfigured } from "@/lib/env";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
import { findVariant, isOutOfStock, toVariantDetail } from "@/utils/product";
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
 * (so it works before JS); the click adds the variant the card shows and opens the bag. Listings
 * don't carry full variant detail, so the click fetches the product first.
 */
export default function AddToCartButton({
  slug,
  productId,
  categoryId,
  selectedOptions,
  soldOut,
  className,
}: AddToCartButtonProps) {
  const client = useApolloClient();
  const { addItem, busy } = useCart();
  const openCart = useCartStore((s) => s.open);
  const [loading, setLoading] = useState(false);

  const onAdd = async () => {
    // Demo catalogue: there's no cart to add to — useCart explains that
    if (!isApiConfigured) {
      await addItem({ productId, categoryId, variant: { selectedOptions, variantPrice: 0 } });
      return;
    }
    setLoading(true);
    try {
      const { data } = await client.query({ query: GET_PRODUCT, variables: { slug } });
      const variants = data?.getClientSideProductById?.variants ?? [];
      const variant = selectedOptions.length ? findVariant(variants, selectedOptions) : variants[0];
      if (!variant) {
        toast.info("That one isn't available right now.");
        return;
      }
      if (isOutOfStock(variant)) {
        toast.info("That one's sold out right now.");
        return;
      }
      const added = await addItem({ productId, categoryId, variant: toVariantDetail(variant) });
      if (added) openCart();
    } catch {
      toast.error("Couldn't add this one. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlobButton
      href={productHref(slug)}
      block
      icon={<RiShoppingBag3Line className="size-4" />}
      aria-disabled={soldOut || undefined}
      onClick={(event) => {
        event.preventDefault();
        if (soldOut || busy || loading) return;
        void onAdd();
      }}
      className={className}
    >
      {soldOut ? "Sold Out" : loading ? "Adding…" : "Add To Cart"}
    </BlobButton>
  );
}
