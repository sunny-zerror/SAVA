"use client";

import { RiHeartFill, RiHeartLine } from "@remixicon/react";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/utils/cn";

interface WishlistButtonProps {
  productId: string;
  name: string;
  className?: string;
}

/** The heart on a product card: saves it to (or takes it off) the shopper's wishlist */
export default function WishlistButton({ productId, name, className }: WishlistButtonProps) {
  const { isSaved, toggle, busy } = useWishlist();
  const saved = isSaved(productId);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={`Save ${name} to your wishlist`}
      disabled={busy}
      onClick={() => void toggle(productId)}
      className={cn(
        "center size-9 rounded-full bg-mist/70 backdrop-blur-sm transition-colors hover:bg-mist",
        className,
      )}
    >
      {saved ? <RiHeartFill className="size-4 text-accent" /> : <RiHeartLine className="size-4" />}
    </button>
  );
}
