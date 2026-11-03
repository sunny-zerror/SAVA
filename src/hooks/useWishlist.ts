"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_TO_WISHLIST, GET_WISHLIST, REMOVE_FROM_WISHLIST } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { errorMessage } from "@/utils/errors";

const refetchWishlist = { refetchQueries: ["GetWishlistItems"], awaitRefetchQueries: true };

/*
 * The signed-in shopper's z-commerce wishlist. z-commerce keys wishlists by user, so guests are
 * asked to sign in first. Every card shares the one query (Apollo dedupes it).
 */
export function useWishlist() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const userId = useAuthStore((s) => s.user?._id);

  const { data } = useQuery(GET_WISHLIST, {
    variables: { userId: userId ?? "", limit: 100 },
    skip: !hydrated || !isLoggedIn || !userId || !isApiConfigured,
  });
  const [addMutation, addState] = useMutation(ADD_TO_WISHLIST, refetchWishlist);
  const [removeMutation, removeState] = useMutation(REMOVE_FROM_WISHLIST, refetchWishlist);

  const items = data?.getWishlistItems.items ?? [];
  const entry = (productId: string) => items.find((item) => item.productId === productId);

  async function toggle(productId: string) {
    if (!isApiConfigured) {
      toast.info("Demo mode — connect z-commerce in .env.local to use the wishlist.");
      return;
    }
    if (!isLoggedIn || !userId) {
      toast.info("Sign in to save products to your wishlist.");
      return;
    }
    const saved = entry(productId);
    try {
      if (saved) {
        await removeMutation({ variables: { userId, wishlistId: saved._id } });
      } else {
        await addMutation({ variables: { userId, input: { productId } } });
        toast.success("Saved to your wishlist");
      }
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't update your wishlist."));
    }
  }

  return {
    isSaved: (productId: string) => Boolean(entry(productId)),
    toggle,
    busy: addState.loading || removeState.loading,
  };
}
