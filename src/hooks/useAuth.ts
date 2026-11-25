"use client";

import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { LOGIN, LOGOUT, SIGN_UP, type SignUpInput } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { localSignIn, localSignUp } from "@/lib/local-shop";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

/*
 * Sign in, sign up and out. On z-commerce through its API; without it, through the local store
 * (src/lib/local-shop.ts): accounts made on this device, where any password signs in, for testing.
 */
export function useAuth() {
  const client = useApolloClient();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  /** Throws with the API's message on bad credentials — show it in the form */
  async function login(email: string, password: string) {
    if (!isApiConfigured) {
      const local = localSignIn(email);
      useAuthStore.getState().setSession(local);
      return local.user;
    }
    const { data } = await client.query({
      query: LOGIN,
      // guestId lets z-commerce move the guest's bag into the account
      variables: { email, password, guestId: useCartStore.getState().guestId },
      fetchPolicy: "no-cache",
    });
    if (!data?.userLogin?.accessToken) throw new Error("Incorrect email or password.");
    useAuthStore.getState().setSession(data.userLogin);
    useCartStore.getState().resetGuestId();
    return data.userLogin.user;
  }

  async function signup(input: Omit<SignUpInput, "status">) {
    if (!isApiConfigured) {
      // The password isn't kept: any password signs in to a local account
      const { firstName, lastName, email, phoneNumber, countryCode, emailSubscribedStatus } = input;
      const local = localSignUp({ firstName, lastName, email, phoneNumber, countryCode, emailSubscribedStatus });
      useAuthStore.getState().setSession(local);
      return local.user;
    }
    const { data } = await client.mutate({
      mutation: SIGN_UP,
      variables: { input: { ...input, status: "ACTIVE" } },
    });
    if (!data?.clientUserSave?.accessToken) throw new Error("Couldn't create your account.");
    useAuthStore.getState().setSession(data.clientUserSave);
    useCartStore.getState().resetGuestId();
    return data.clientUserSave.user;
  }

  async function logout() {
    const userId = useAuthStore.getState().user?._id;
    if (userId && isApiConfigured) {
      // Best effort — the local session is cleared either way
      await client.mutate({ mutation: LOGOUT, variables: { userId } }).catch(() => undefined);
    }
    useAuthStore.getState().clear();
    await client.clearStore();
    router.push("/");
  }

  return { user, hydrated, isLoggedIn, login, signup, logout };
}
