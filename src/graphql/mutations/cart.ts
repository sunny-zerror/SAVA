import { gql, type TypedDocumentNode } from "@apollo/client";
import type { Address, EmailSubscribedStatus, VariantDetail } from "@/types";

/** Logged in: pass input.token. Guest: pass guestId. Adds one unit per call. */
export const ADD_ITEM_TO_CART: TypedDocumentNode<
  { addItemToCart: string },
  {
    input: { productId: string; categoryId?: string; variantDetail: VariantDetail; token?: string };
    guestId?: string;
  }
> = gql`
  mutation AddItemToCart($input: CreateCartInput, $guestId: String) {
    addItemToCart(input: $input, guestId: $guestId)
  }
`;

/** isCompleteRemove: false takes one unit off, true removes the line */
export const REMOVE_ITEM_FROM_CART: TypedDocumentNode<
  { removeItemFromCart: string },
  {
    input: {
      productId: string;
      variantDetailId?: string;
      isCompleteRemove: boolean;
      userId?: string;
      guestId?: string;
    };
  }
> = gql`
  mutation RemoveItemFromCart($input: RemoveItemFromCartInput!) {
    removeItemFromCart(input: $input)
  }
`;

export const APPLY_COUPON: TypedDocumentNode<
  { applyCartCoupon: { _id: string } },
  { couponCode: string; token?: string; guestId?: string }
> = gql`
  mutation ApplyCartCoupon($couponCode: String!, $token: String, $guestId: String) {
    applyCartCoupon(couponCode: $couponCode, token: $token, guestId: $guestId) {
      _id
    }
  }
`;

export const REMOVE_COUPON: TypedDocumentNode<{ removeCartCoupon: string }, { token?: string; guestId?: string }> = gql`
  mutation RemoveCartCoupon($token: String, $guestId: String) {
    removeCartCoupon(token: $token, guestId: $guestId)
  }
`;

export interface CheckoutInput {
  cartId: string;
  userData: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    countryCode: string;
    emailSubscribedStatus: EmailSubscribedStatus;
  };
  shippingAddress: Omit<Address, "_id" | "userId">;
  billingAddress: Omit<Address, "_id" | "userId">;
}

/** Creates the order and returns the Nimbbl token that opens the payment modal */
export const CHECKOUT: TypedDocumentNode<
  {
    clientCheckout: {
      data: { _id: string; orderNo: string; paymentStatus?: string | null };
      nimbblData: { token: string; order_id?: string | null; total_amount?: number | null } | null;
    };
  },
  { input: CheckoutInput }
> = gql`
  mutation ClientCheckout($input: CheckoutOrderInput!) {
    clientCheckout(input: $input) {
      data {
        _id
        orderNo
        paymentStatus
      }
      nimbblData {
        token
        order_id
        total_amount
      }
    }
  }
`;
