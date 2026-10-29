import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface CartUiState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  /** Anonymous cart owner id — z-commerce keys guest carts by it */
  guestId: string | null;
  ensureGuestId: () => string;
  /** After login the guest cart is merged into the account, so start a fresh guest id */
  resetGuestId: () => void;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Cart contents live on the server (GET_CART); this store only holds UI state and the guest id
export const useCartStore = create<CartUiState>()(
  persist(
    (set, get) => ({
      isOpen: false,
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      guestId: null,
      ensureGuestId: () => {
        const existing = get().guestId;
        if (existing) return existing;
        const guestId = newId();
        set({ guestId });
        return guestId;
      },
      resetGuestId: () => set({ guestId: newId() }),
    }),
    {
      name: "zc-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: ({ guestId }) => ({ guestId }),
      skipHydration: true,
    },
  ),
);
