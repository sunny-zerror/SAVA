"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_TO_WISHLIST, GET_WISHLIST, REMOVE_FROM_WISHLIST } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { wishlistsStore } from "@/lib/local-shop";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { toast } from "@/store/toast-store";
import { errorMessage } from "@/utils/errors";

const refetchWishlist = { refetchQueries: ["GetWishlistItems"], awaitRefetchQueries: true };

/*
 * The signed-in shopper's wishlist: z-commerce's (keyed by user, so guests are asked to sign in
 * first; every card shares the one query, Apollo dedupes it), or the local store's without it.
 */
export function useWishlist() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const userId = useAuthStore((s) => s.user?._id);

  const { data } = useQuery(GET_WISHLIST, {
    variables: { userId: userId ?? "", limit: 100 },
    skip: !hydrated || !isLoggedIn || !userId || !isApiConfigured,
  });
  const localLists = wishlistsStore.useValue();
  const [addMutation, addState] = useMutation(ADD_TO_WISHLIST, refetchWishlist);
  const [removeMutation, removeState] = useMutation(REMOVE_FROM_WISHLIST, refetchWishlist);

  const items = data?.getWishlistItems.items ?? [];
  const localSaved = isLoggedIn && userId ? (localLists[userId] ?? []) : [];
  const entry = (productId: string) => items.find((item) => item.productId === productId);
  const isSaved = (productId: string) => (isApiConfigured ? Boolean(entry(productId)) : localSaved.includes(productId));

  async function toggle(productId: string) {
    if (!isLoggedIn || !userId) {
      toast.info("Sign in to save products to your wishlist.");
      return;
    }
    if (!isApiConfigured) {
      const saved = isSaved(productId);
      wishlistsStore.write((all) => {
        const list = all[userId] ?? [];
        return { ...all, [userId]: saved ? list.filter((id) => id !== productId) : [...list, productId] };
      });
      if (!saved) toast.success("Saved to your wishlist");
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
    isSaved,
    toggle,
    busy: addState.loading || removeState.loading,
  };
}
