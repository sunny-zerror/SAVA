import { create } from "zustand";

interface SearchUiState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/** Whether the search drawer is open — the header's Search button and ⌘K / Ctrl+K open it */
export const useSearchStore = create<SearchUiState>()((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
