import { gql, type TypedDocumentNode } from "@apollo/client";
import { ADDRESS, USER } from "@/graphql/fields";
import type { Address, AuthPayload, EmailSubscribedStatus, User, UserStatus } from "@/types";

export interface SignUpInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  countryCode?: string;
  status: UserStatus;
  emailSubscribedStatus?: EmailSubscribedStatus;
}

export const SIGN_UP: TypedDocumentNode<{ clientUserSave: AuthPayload }, { input: SignUpInput }> = gql`
  mutation ClientUserSave($input: CreateUserInput!) {
    clientUserSave(input: $input) {
      accessToken
      refreshToken
      user { ${USER} }
    }
  }
`;

export const LOGOUT: TypedDocumentNode<{ userLogout: boolean | string }, { userId: string }> = gql`
  mutation UserLogout($userId: ID!) {
    userLogout(userId: $userId)
  }
`;

export const UPDATE_PROFILE: TypedDocumentNode<
  { clientUserUpdate: { user: User } },
  { id: string; input: Partial<SignUpInput> }
> = gql`
  mutation ClientUserUpdate($input: CreateUserInput!, $id: ID!) {
    clientUserUpdate(input: $input, id: $id) {
      user { ${USER} }
    }
  }
`;

export const CHANGE_PASSWORD: TypedDocumentNode<
  { changeUserPassword: AuthPayload },
  { email: string; currentPassword: string; newPassword: string }
> = gql`
  mutation ChangeUserPassword($email: String!, $currentPassword: String!, $newPassword: String!) {
    changeUserPassword(email: $email, currentPassword: $currentPassword, newPassword: $newPassword) {
      accessToken
      refreshToken
      user {
        _id
      }
    }
  }
`;

/** Creates an address, or updates it when `id` is passed. input.userId is the owner. */
export const SAVE_ADDRESS: TypedDocumentNode<
  { addressSaveOrUpdate: Address },
  { input: Omit<Address, "_id">; id?: string }
> = gql`
  mutation AddressSaveOrUpdate($input: CreateAddressInput!, $id: ID) {
    addressSaveOrUpdate(input: $input, id: $id) { ${ADDRESS} }
  }
`;

export const ADD_TO_WISHLIST: TypedDocumentNode<
  { addToWishlist: { _id: string } },
  { userId: string; input: { productId: string; variantId?: string } }
> = gql`
  mutation AddToWishlist($input: AddToWishlistInput!, $userId: ID!) {
    addToWishlist(input: $input, userId: $userId) {
      _id
    }
  }
`;

export const REMOVE_FROM_WISHLIST: TypedDocumentNode<
  { removeFromWishlist: boolean | string },
  { userId: string; wishlistId: string }
> = gql`
  mutation RemoveFromWishlist($wishlistId: ID!, $userId: ID!) {
    removeFromWishlist(wishlistId: $wishlistId, userId: $userId)
  }
`;

export const CREATE_CONTACT: TypedDocumentNode<
  { createContact: string },
  { input: { name: string; email: string; phoneNumber?: string; subject: string; message: string } }
> = gql`
  mutation CreateContact($input: CreateContactInput!) {
    createContact(input: $input)
  }
`;
