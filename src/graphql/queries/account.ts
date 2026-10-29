import { gql, type TypedDocumentNode } from "@apollo/client";
import { ADDRESS, CART, ORDER, USER } from "@/graphql/fields";
import type { Address, AuthPayload, Cart, Order, Paginated, PaymentRecord } from "@/types";

/** Login is a query on z-commerce. Pass guestId to merge the guest cart into the account. */
export const LOGIN: TypedDocumentNode<
  { userLogin: AuthPayload },
  { email: string; password: string; guestId?: string | null }
> = gql`
  query UserLogin($email: String!, $password: String!, $guestId: ID) {
    userLogin(email: $email, password: $password, guestId: $guestId) {
      accessToken
      refreshToken
      user { ${USER} }
    }
  }
`;

/** Raw string — the Apollo error link posts it with fetch while refreshing */
export const REFRESH_TOKEN_QUERY = /* GraphQL */ `
  query RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      accessToken
      refreshToken
    }
  }
`;

/** Logged-in carts are looked up by token, guest carts by guestId, a checkout by cartId */
export const GET_CART: TypedDocumentNode<
  { getCart: Cart | null },
  { guestId?: string; token?: string; cartId?: string }
> = gql`
  query GetCart($guestId: String, $cartId: String, $token: String) {
    getCart(guestId: $guestId, cartId: $cartId, token: $token) { ${CART} }
  }
`;

export const GET_ADDRESSES: TypedDocumentNode<
  { getAddressByFilters: Paginated<Address> },
  {
    filters?: { userId?: string } & Record<string, unknown>;
    limit?: number;
    offset?: number;
    sort?: Record<string, "ASC" | "DESC">;
  }
> = gql`
  query GetAddressByFilters($filters: AddressFilterInput, $limit: Int, $offset: Int, $sort: AddressSortInput) {
    getAddressByFilters(filters: $filters, limit: $limit, offset: $offset, sort: $sort) {
      data { ${ADDRESS} }
      totalCount
    }
  }
`;

export const GET_ORDERS: TypedDocumentNode<
  { getOrdersByFilters: Paginated<Order> },
  { filter?: Record<string, unknown>; limit?: number; offset?: number }
> = gql`
  query GetOrdersByFilters($offset: Int, $limit: Int, $filter: OrderFilterInput) {
    getOrdersByFilters(offset: $offset, limit: $limit, filter: $filter) {
      data { ${ORDER} }
      totalCount
    }
  }
`;

/** Order confirmation — `id` is the orderId z-commerce puts in the payment redirect URL */
export const GET_ORDER_PAYMENT: TypedDocumentNode<
  { getClientSidePaymentByOrderId: PaymentRecord | null },
  { id: string }
> = gql`
  query GetClientSidePaymentByOrderId($id: ID!) {
    getClientSidePaymentByOrderId(id: $id) {
      _id
      currentStatus
      totalAmount
      order {
        ${ORDER}
        shippingAddress { ${ADDRESS} }
        billingAddress { ${ADDRESS} }
      }
    }
  }
`;

export const GET_WISHLIST: TypedDocumentNode<
  {
    getWishlistItems: {
      items: {
        _id: string;
        productId: string;
        product: {
          _id: string;
          name: string;
          slug: string;
          price: number;
          discountedPrice?: number | null;
          assets: { path: string; altText?: string | null }[];
        };
      }[];
      totalCount: number;
    };
  },
  { userId: string; limit?: number; offset?: number }
> = gql`
  query GetWishlistItems($limit: Int, $offset: Int, $filters: GetWishlistFilterInput, $userId: ID!) {
    getWishlistItems(limit: $limit, offset: $offset, filters: $filters, userId: $userId) {
      items {
        _id
        productId
        product {
          _id
          name
          slug
          price
          discountedPrice
          assets {
            path
            altText
          }
        }
      }
      totalCount
    }
  }
`;
