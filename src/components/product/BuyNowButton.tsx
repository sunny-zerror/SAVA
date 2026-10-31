"use client";

import { useApolloClient } from "@apollo/client/react";
import { RiShoppingBag3Line } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BlobButton from "@/components/ui/BlobButton";
import { GET_PRODUCT } from "@/graphql";
import { useCart } from "@/hooks/useCart";
import { isApiConfigured } from "@/lib/env";
import { toast } from "@/store/toast-store";
import { isOutOfStock, toVariantDetail } from "@/utils/product";

interface BuyNowButtonProps {
  slug: string;
  productId: string;
  categoryId?: string;
  soldOut?: boolean;
  className?: string;
}

/**
 * "Buy It Now" on a listing card — SAVA's BlobButton (BlobButton is always a link, so it points at
 * /shop). The click fetches the full product (listings don't carry variant detail), adds its single
 * variant to the bag and goes straight to checkout. Products with options can't be bought from a
 * card, so they get a toast instead.
 */
export default function BuyNowButton({ slug, productId, categoryId, soldOut, className }: BuyNowButtonProps) {
  const client = useApolloClient();
  const router = useRouter();
  const { addItem, busy } = useCart();
  const [loading, setLoading] = useState(false);

  const onBuy = async () => {
    // Demo catalogue: there's no cart to add to — useCart explains that
    if (!isApiConfigured) {
      await addItem({ productId, categoryId, variant: { selectedOptions: [], variantPrice: 0 } });
      return;
    }
    setLoading(true);
    try {
      const { data } = await client.query({ query: GET_PRODUCT, variables: { slug } });
      const product = data?.getClientSideProductById;
      if (!product) {
        toast.error("Couldn't load this one. Please try again.");
        return;
      }
      if ((product.productOptions ?? []).length > 0) {
        toast.info("That one comes in options — it can't be bought from here yet.");
        return;
      }
      const variant = product.variants?.[0];
      if (!variant) {
        toast.info("That one isn't available right now.");
        return;
      }
      if (isOutOfStock(variant)) {
        toast.info("That one's sold out right now.");
        return;
      }
      const added = await addItem({ productId, categoryId, variant: toVariantDetail(variant) });
      if (added) router.push("/checkout");
    } catch {
      toast.error("Couldn't load this one. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BlobButton
      href="/shop"
      block
      icon={<RiShoppingBag3Line className="size-4" />}
      aria-disabled={soldOut || undefined}
      onClick={(event) => {
        event.preventDefault();
        if (soldOut || busy || loading) return;
        void onBuy();
      }}
      className={className}
    >
      {soldOut ? "Sold Out" : loading ? "Adding…" : "Buy It Now"}
    </BlobButton>
  );
}
