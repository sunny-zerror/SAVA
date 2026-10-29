"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { ADD_ITEM_TO_CART, APPLY_COUPON, GET_CART, REMOVE_COUPON, REMOVE_ITEM_FROM_CART } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
import type { CartLine, VariantDetail } from "@/types";
import { errorMessage } from "@/utils/errors";
import { stripTypename } from "@/utils/product";

const refetchCart = { refetchQueries: ["GetCart"], awaitRefetchQueries: true };

function requireApi() {
  if (isApiConfigured) return true;
  toast.info("Demo mode — connect z-commerce in .env.local to use the cart.");
  return false;
}

/*
 * The server-side cart. Signed-in shoppers are identified by their access token,
 * guests by the guestId from the cart store — z-commerce merges the guest cart
 * into the account when they log in.
 */
export function useCart() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const accessToken = useAuthStore((s) => s.accessToken);
  const userId = useAuthStore((s) => s.user?._id);
  const guestId = useCartStore((s) => s.guestId);

  const owner = isLoggedIn && accessToken ? { token: accessToken } : guestId ? { guestId } : null;

  const { data, loading } = useQuery(GET_CART, {
    variables: owner ?? {},
    skip: !hydrated || !owner || !isApiConfigured,
    fetchPolicy: "cache-and-network",
  });

  const [addMutation, addState] = useMutation(ADD_ITEM_TO_CART, refetchCart);
  const [removeMutation, removeState] = useMutation(REMOVE_ITEM_FROM_CART, refetchCart);
  const [applyMutation, applyState] = useMutation(APPLY_COUPON, refetchCart);
  const [removeCouponMutation] = useMutation(REMOVE_COUPON, refetchCart);

  const cart = data?.getCart ?? null;

  async function addItem(item: { productId: string; categoryId?: string; variant: VariantDetail }) {
    if (!requireApi()) return false;
    try {
      await addMutation({
        variables: {
          input: {
            productId: item.productId,
            categoryId: item.categoryId,
            variantDetail: stripTypename(item.variant),
            ...(isLoggedIn && accessToken ? { token: accessToken } : {}),
          },
          ...(!isLoggedIn ? { guestId: useCartStore.getState().ensureGuestId() } : {}),
        },
      });
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't add this to your bag."));
      return false;
    }
  }

  async function removeItem(line: CartLine, completely = true) {
    if (!requireApi()) return;
    try {
      await removeMutation({
        variables: {
          input: {
            productId: line.productId,
            variantDetailId: line.variantDetail?.variantDetailId,
            isCompleteRemove: completely,
            ...(isLoggedIn && userId ? { userId } : { guestId: guestId ?? undefined }),
          },
        },
      });
    } catch (error) {
      toast.error(errorMessage(error, "Couldn't update your bag."));
    }
  }

  const increment = (line: CartLine) =>
    line.variantDetail ? addItem({ productId: line.productId, variant: line.variantDetail }) : Promise.resolve(false);

  const decrement = (line: CartLine) => removeItem(line, line.qty <= 1);

  async function applyCoupon(couponCode: string) {
    if (!requireApi()) return false;
    try {
      await applyMutation({ variables: { couponCode, ...(owner ?? {}) } });
      toast.success("Coupon applied");
      return true;
    } catch (error) {
      toast.error(errorMessage(error, "That coupon can't be used."));
      return false;
    }
  }

  async function removeCoupon() {
    try {
      await removeCouponMutation({ variables: { ...(owner ?? {}) } });
    } catch (error) {
      toast.error(errorMessage(error));
    }
  }

  return {
    cart,
    lines: cart?.cart ?? [],
    count: cart?.itemcount ?? 0,
    subtotal: cart?.totalprice ?? 0,
    loading: !hydrated || (loading && !cart),
    busy: addState.loading || removeState.loading || applyState.loading,
    addItem,
    removeItem,
    increment,
    decrement,
    applyCoupon,
    removeCoupon,
  };
}
