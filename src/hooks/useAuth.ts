"use client";

import { useApolloClient } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { LOGIN, LOGOUT, SIGN_UP, type SignUpInput } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";

const notConfigured = () => new Error("Demo mode — connect z-commerce in .env.local to sign in.");

export function useAuth() {
  const client = useApolloClient();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);

  /** Throws with the API's message on bad credentials — show it in the form */
  async function login(email: string, password: string) {
    if (!isApiConfigured) throw notConfigured();
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
    if (!isApiConfigured) throw notConfigured();
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
