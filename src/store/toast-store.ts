import { create } from "zustand";

export type ToastTone = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  tone: ToastTone;
  message: string;
  /** A bold line above the message */
  title?: string;
  /** How long it stays (ms), not counting time hovered */
  duration: number;
  /** Bumped when the same toast is pushed again: its countdown starts over instead of a copy stacking */
  round: number;
  /** Sliding out */
  leaving: boolean;
}

interface ToastOptions {
  title?: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  push: (tone: ToastTone, message: string, options?: ToastOptions) => void;
  dismiss: (id: number) => void;
}

const DURATION = 4000;
/** At most this many on screen; the oldest make way */
const LIMIT = 4;
/** The slide out (keep in step with --animate-toast-out in globals.css) */
const LEAVE_MS = 300;

let nextId = 1;

export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (tone, message, { title, duration = DURATION } = {}) => {
    const same = get().toasts.find((t) => !t.leaving && t.tone === tone && t.message === message && t.title === title);
    if (same) {
      set((s) => ({ toasts: s.toasts.map((t) => (t === same ? { ...t, round: t.round + 1 } : t)) }));
      return;
    }
    const toast: ToastItem = { id: nextId++, tone, message, title, duration, round: 0, leaving: false };
    set((s) => ({ toasts: [...s.toasts, toast] }));
    get()
      .toasts.filter((t) => !t.leaving)
      .slice(0, -LIMIT)
      .forEach((t) => get().dismiss(t.id));
  },
  dismiss: (id) => {
    set((s) => ({ toasts: s.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), LEAVE_MS);
  },
}));

/** Notifications, callable from anywhere (components, hooks, links); shown by <Toaster /> */
export const toast = {
  success: (message: string, options?: ToastOptions) => useToastStore.getState().push("success", message, options),
  error: (message: string, options?: ToastOptions) => useToastStore.getState().push("error", message, options),
  info: (message: string, options?: ToastOptions) => useToastStore.getState().push("info", message, options),
};
