import { create } from "zustand";
import type { ContactFlow, ReplyExtras } from "@/lib/assistant/replies";

/** What the assistant is doing: the orb's pace and glow follow it */
export type AssistantPhase =
  "idle" | "entering" | "listening" | "thinking" | "replying" | "dictating" | "sleeping" | "exiting";

export interface AssistantMessage extends ReplyExtras {
  id: string;
  role: "user" | "assistant";
  text: string;
  /** Its letter-by-letter reveal has played: from then on it shows at once */
  revealed?: boolean;
}

interface AssistantState {
  isOpen: boolean;
  /** Opened at least once this visit: the intro bubble stays quiet from then on */
  hasOpened: boolean;
  /** The launcher's centre (px), where the ripple starts and ends */
  origin: { x: number; y: number } | null;
  phase: AssistantPhase;
  /** Which conversation this is: a new one starts afresh (the transcript remounts on it) */
  conversation: number;
  messages: AssistantMessage[];
  /** The shopper has sent something: the quick actions go and, on phones, the orb shrinks */
  hasInteracted: boolean;
  /** "Leave a message" under way */
  contactFlow: ContactFlow | null;
  error: string | null;
  open: (origin: { x: number; y: number } | null) => void;
  close: () => void;
  setPhase: (phase: AssistantPhase) => void;
  setError: (error: string | null) => void;
  setContactFlow: (contactFlow: ContactFlow | null) => void;
  /** Adds a message and returns its id */
  addMessage: (message: Omit<AssistantMessage, "id">) => string;
  markRevealed: (id: string) => void;
  /** Clears the conversation for a new one (the overlay adds the welcome again) */
  reset: () => void;
}

let lastId = 0;

/*
 * The shopping assistant: open or shut, what it's doing, and the conversation. In memory only, never
 * persisted, so nothing the shopper typed outlives a reload; it stays while they move around the site
 * and shows again (without replaying) when the assistant reopens.
 */
export const useAssistantStore = create<AssistantState>()((set) => ({
  isOpen: false,
  hasOpened: false,
  origin: null,
  phase: "idle",
  conversation: 0,
  messages: [],
  hasInteracted: false,
  contactFlow: null,
  error: null,
  open: (origin) =>
    set((s) => (s.isOpen ? s : { isOpen: true, hasOpened: true, origin: origin ?? s.origin, error: null })),
  close: () => set((s) => (s.isOpen ? { isOpen: false } : s)),
  setPhase: (phase) => set({ phase }),
  setError: (error) => set({ error }),
  setContactFlow: (contactFlow) => set({ contactFlow }),
  addMessage: (message) => {
    const id = `assistant-message-${++lastId}`;
    set((s) => ({
      messages: [...s.messages, { ...message, id }],
      hasInteracted: s.hasInteracted || message.role === "user",
    }));
    return id;
  },
  markRevealed: (id) =>
    set((s) => ({
      messages: s.messages.map((message) => (message.id === id ? { ...message, revealed: true } : message)),
    })),
  reset: () =>
    set((s) => ({
      conversation: s.conversation + 1,
      messages: [],
      hasInteracted: false,
      contactFlow: null,
      error: null,
    })),
}));
