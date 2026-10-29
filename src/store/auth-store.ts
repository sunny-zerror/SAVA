import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User } from "@/types";
import { clearSessionCookie, setSessionCookie } from "@/utils/session-cookie";

interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** true once the persisted session has been read from localStorage */
  hydrated: boolean;
  setSession: (session: Session) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

/*
 * Signed-in customer + z-commerce tokens. Persisted to localStorage; a small
 * `zc_session` cookie mirrors "is signed in" so src/proxy.ts can guard /account.
 * Outside React (Apollo links) read it with useAuthStore.getState().
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hydrated: false,
      setSession: ({ user, accessToken, refreshToken }) => {
        setSessionCookie();
        set({ user, accessToken, refreshToken });
      },
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      clear: () => {
        clearSessionCookie();
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: "zc-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ user, accessToken, refreshToken }) => ({ user, accessToken, refreshToken }),
      // Rehydrated in <StoreHydration /> after mount, so server and first client render match
      skipHydration: true,
    },
  ),
);

export const selectIsLoggedIn = (s: AuthState) => Boolean(s.user && s.accessToken);
