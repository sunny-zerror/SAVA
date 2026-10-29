"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { clearSessionCookie, setSessionCookie } from "@/utils/session-cookie";

/*
 * Reads persisted stores after mount (they use skipHydration), so the first
 * client render matches the server render. Also re-syncs the session cookie
 * the proxy reads, in case localStorage was cleared but the cookie wasn't.
 */
export default function StoreHydration() {
  useEffect(() => {
    Promise.all([useAuthStore.persist.rehydrate(), useCartStore.persist.rehydrate()]).then(() => {
      useCartStore.getState().ensureGuestId();
      if (useAuthStore.getState().user) setSessionCookie();
      else clearSessionCookie();
      useAuthStore.setState({ hydrated: true });
    });
  }, []);

  return null;
}
