"use client";

import { CombinedGraphQLErrors } from "@apollo/client";
import { useApolloClient } from "@apollo/client/react";
import { RiCloseLine } from "@remixicon/react";
import { useLenis } from "lenis/react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import AssistantInput, { type AssistantInputHandle } from "@/components/assistant/AssistantInput";
import AssistantOrb from "@/components/assistant/AssistantOrb";
import AssistantTranscript, { assistantChip } from "@/components/assistant/AssistantTranscript";
import Sparkle from "@/components/ui/Sparkle";
import { ASSISTANT_DIALOG_ID, assistantConfig } from "@/config/assistant";
import { CREATE_CONTACT, GET_ORDERS, GET_PROMOTIONS } from "@/graphql";
import { useDictation } from "@/hooks/useDictation";
import { DICTATION_SOUND_LEVEL } from "@/lib/assistant/dictation";
import { rippleRadius } from "@/lib/assistant/painter";
import {
  assistantCopy,
  contactSentReply,
  getAssistantReply,
  matchAssistantIntent,
  QUICK_ACTIONS,
  revealDuration,
  thinkingPhrase,
  type AssistantLoaders,
  type AssistantReply,
} from "@/lib/assistant/replies";
import { isApiConfigured } from "@/lib/env";
import { localSendMessage, ordersOf, ordersStore } from "@/lib/local-shop";
import { gsap, useGSAP } from "@/lib/gsap";
import { useAssistantStore, type AssistantPhase } from "@/store/assistant-store";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import type { SearchProduct, SearchResults } from "@/types";
import { cn } from "@/utils/cn";
import { errorMessage } from "@/utils/errors";

/** The ripple that opens it out of the launcher, and the one that closes it back in (ms) */
const OPEN_MS = 1100;
const CLOSE_MS = 900;
/** The content fades in this long after the click, over FADE_MS; closing, it fades out over FADE_MS */
const CONTENT_DELAY_MS = 650;
const FADE_MS = 450;
/** With reduced motion it fades in and out instead */
const REDUCED_FADE_MS = 250;
/** The shortest wait for a reply, so it reads as an answer rather than a flash */
const REPLY_DELAY_MS = 420;
/** Closing waits this long for its history step back before closing anyway */
const HISTORY_FALLBACK_MS = 400;
/** A reply that leaves (for a page, the bag) is read for this long first */
const LEAVE_DELAY_MS = 700;
const MESSAGE_MAX_LENGTH = 2000;
/** Talking into the microphone counts as activity at most this often */
const LEVEL_BUMP_MS = 1000;

const BUSY = new Set<AssistantPhase>(["thinking", "replying"]);
/** Direct children of <body> left as they are while the page behind goes inert */
const UNTOUCHED = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT", "NEXT-ROUTE-ANNOUNCER"]);

const seconds = (ms: number) => ms / 1000;
const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/** The error strip's words for a read or send that failed */
const shopperMessage = (error: unknown) =>
  CombinedGraphQLErrors.is(error) ? errorMessage(error, assistantCopy.networkError) : assistantCopy.networkError;

/** Where a plain click on a link to this site leads, else null (new tabs and other sites are left alone) */
function internalHref(event: React.MouseEvent) {
  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (
    !(anchor instanceof HTMLAnchorElement) ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    anchor.target === "_blank"
  ) {
    return null;
  }
  const url = new URL(anchor.href, window.location.href);
  return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : null;
}

/** What happens once it has closed: a page to go to, or something to open (the bag) */
interface Exit {
  href?: string;
  then?: () => void;
}

interface AssistantOverlayProps {
  /** The range to start from: in stock, as SiteLayout loads it for the search drawer */
  products: SearchProduct[];
  /** The launcher's button: the closing ripple collapses back into it */
  launcher: React.RefObject<HTMLButtonElement | null>;
}

/**
 * The shopping assistant, full screen. It opens in a circle spreading out of the launcher, light
 * bending on the circle's edge, and its content fades in as the circle covers the screen; closing
 * runs it back into the launcher. While it's open the page behind is inert and still, Back closes it
 * (it adds one history entry), and links inside close it before they go.
 *
 * The conversation sits beside the orb (above it on phones): replies come from getAssistantReply on the
 * store's own data, and the conversation itself lives in the assistant store, in memory only. The
 * launcher loads this on demand, client-side only.
 */
export default function AssistantOverlay({ products, launcher }: AssistantOverlayProps) {
  const router = useRouter();
  const client = useApolloClient();
  const lenis = useLenis();

  const isOpen = useAssistantStore((s) => s.isOpen);
  const phase = useAssistantStore((s) => s.phase);
  const messages = useAssistantStore((s) => s.messages);
  const hasInteracted = useAssistantStore((s) => s.hasInteracted);
  const error = useAssistantStore((s) => s.error);
  const setError = useAssistantStore((s) => s.setError);
  const markRevealed = useAssistantStore((s) => s.markRevealed);

  const [thinking, setThinking] = useState<string | null>(null);
  // On screen from the moment it opens until the closing ripple has gone: the orb only draws then
  const [closing, setClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    setClosing(!isOpen);
  }

  const root = useRef<HTMLDivElement>(null);
  const ripple = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<AssistantInputHandle>(null);
  const micLevel = useRef(0);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  // Every new reply (or interruption) takes a new token: one still on its way with an older one is dropped
  const replyToken = useRef(0);
  const sending = useRef(false);
  const historyEntry = useRef(false);
  const pendingExit = useRef<Exit | null>(null);
  const idleTimer = useRef<number | undefined>(undefined);
  const phaseTimer = useRef<number | undefined>(undefined);
  const lastLevelBump = useRef(0);

  // ---------- Activity: the orb sleeps after a while without any ---------------

  const bump = () => {
    window.clearTimeout(idleTimer.current);
    const state = useAssistantStore.getState();
    if (!state.isOpen) return;
    if (state.phase === "sleeping") state.setPhase("listening");
    idleTimer.current = window.setTimeout(() => {
      const current = useAssistantStore.getState();
      if (current.isOpen && current.phase === "listening") current.setPhase("sleeping");
    }, assistantConfig.sleepMs);
  };

  // ---------- Dictation ----------------------------------------------------------

  const dictation = useDictation({
    onConfirm: (text) => {
      input.current?.insert(text);
      bump();
    },
    onError: (message) => setError(message),
    onLevel: (level) => {
      micLevel.current = level;
      const now = performance.now();
      if (level > DICTATION_SOUND_LEVEL && now - lastLevelBump.current > LEVEL_BUMP_MS) {
        lastLevelBump.current = now;
        bump();
      }
    },
  });

  useEffect(() => {
    const state = useAssistantStore.getState();
    if (dictation.isDictating) state.setPhase("dictating");
    else if (state.phase === "dictating") state.setPhase("listening");
  }, [dictation.isDictating]);

  // ---------- Replies ------------------------------------------------------------

  /** "Replying" while the reply reveals, then back to listening */
  const playReply = (text: string, token: number) => {
    window.clearTimeout(phaseTimer.current);
    useAssistantStore.getState().setPhase("replying");
    phaseTimer.current = window.setTimeout(() => {
      if (replyToken.current !== token) return;
      const state = useAssistantStore.getState();
      if (state.phase === "replying") state.setPhase("listening");
      bump();
    }, revealDuration(text));
  };

  /** Stops a reply on its way: Stop, a new message, dictating */
  const interrupt = () => {
    if (sending.current) return;
    replyToken.current++;
    window.clearTimeout(phaseTimer.current);
    setThinking(null);
    const state = useAssistantStore.getState();
    if (BUSY.has(state.phase)) state.setPhase("listening");
  };

  /** The reads behind the replies: the pages' own search, and the shopper's own orders and offers */
  const loaders: AssistantLoaders = {
    range: products,
    search: async (term) => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error(`Search failed (${response.status})`);
      return (await response.json()) as SearchResults;
    },
    orders: async () => {
      const user = useAuthStore.getState().user;
      if (!user) return null;
      // Without z-commerce: the orders placed in this browser (src/lib/local-shop.ts)
      if (!isApiConfigured) return ordersOf(ordersStore.read(), user._id);
      try {
        // As the account's Orders tab asks for them, so the two share Apollo's cache
        const { data } = await client.query({
          query: GET_ORDERS,
          variables: { filter: { userId: user._id }, limit: 50, offset: 0 },
          fetchPolicy: "network-only",
        });
        return data?.getOrdersByFilters.data ?? [];
      } catch (failure) {
        // The session couldn't be refreshed (the error link signed them out): answer as for a guest
        if (!selectIsLoggedIn(useAuthStore.getState())) return null;
        throw failure;
      }
    },
    offers: async () => {
      if (!isApiConfigured) return [];
      const guestId = selectIsLoggedIn(useAuthStore.getState()) ? null : useCartStore.getState().guestId;
      const { data } = await client.query({
        query: GET_PROMOTIONS,
        variables: guestId ? { guestId } : {},
        fetchPolicy: "network-only",
      });
      return data?.getAllValidPromotions ?? [];
    },
  };

  // ---------- Closing ------------------------------------------------------------

  /** Shut, then go wherever the last reply was headed */
  const finishClose = () => {
    historyEntry.current = false;
    useAssistantStore.getState().close();
    const exit = pendingExit.current;
    pendingExit.current = null;
    exit?.then?.();
    if (exit?.href) router.push(exit.href);
  };

  const stopEverything = () => {
    replyToken.current++;
    window.clearTimeout(phaseTimer.current);
    window.clearTimeout(idleTimer.current);
    dictation.cancel();
    setThinking(null);
  };

  /** Closes it, taking back its history entry, then follows `exit` */
  const requestClose = (exit: Exit = {}) => {
    stopEverything();
    const ownEntry = Boolean(historyEntry.current && window.history.state?.savaAssistant);
    const target = exit.href ? new URL(exit.href, window.location.href) : null;
    const elsewhere = target !== null && target.pathname + target.search !== location.pathname + location.search;
    // Off to another page: it takes over the assistant's history entry, so Back from there comes
    // straight back here. (Stepping back and then pushing loses the push to Next replaying the step.)
    if (elsewhere && ownEntry && exit.href) {
      historyEntry.current = false;
      useAssistantStore.getState().close();
      router.replace(exit.href);
      return;
    }
    // A link to this very page just closes it
    pendingExit.current = elsewhere ? exit : { then: exit.then };
    if (ownEntry) {
      window.history.back();
      // popstate closes it; this covers a browser where it never comes
      window.setTimeout(() => {
        if (useAssistantStore.getState().isOpen) finishClose();
      }, HISTORY_FALLBACK_MS);
      return;
    }
    finishClose();
  };

  // ---------- Sending ------------------------------------------------------------

  const sendMessage = async (raw: string) => {
    const text = raw.trim().slice(0, MESSAGE_MAX_LENGTH);
    if (!text || sending.current) return;
    const store = useAssistantStore.getState();
    if (BUSY.has(store.phase)) interrupt();
    bump();
    store.setError(null);
    store.addMessage({ role: "user", text });

    const token = ++replyToken.current;
    setThinking(thinkingPhrase(store.contactFlow ? null : matchAssistantIntent(text).intent));
    store.setPhase("thinking");
    const startedAt = performance.now();

    let reply: AssistantReply;
    try {
      const auth = useAuthStore.getState();
      reply = await getAssistantReply(text, {
        contactFlow: useAssistantStore.getState().contactFlow,
        user: selectIsLoggedIn(auth) ? auth.user : null,
        loaders,
      });
      if (reply.action?.type === "send-contact") {
        sending.current = true;
        try {
          // Without z-commerce the message is kept in this browser, as the contact form does
          if (isApiConfigured) {
            await client.mutate({ mutation: CREATE_CONTACT, variables: { input: reply.action.input } });
          } else {
            localSendMessage(reply.action.input);
          }
        } finally {
          sending.current = false;
        }
        // Sent: the flow is over, even if the shopper closed the assistant meanwhile
        useAssistantStore.getState().setContactFlow(null);
        reply = contactSentReply();
      }
    } catch (failure) {
      if (replyToken.current !== token) return;
      setThinking(null);
      const current = useAssistantStore.getState();
      current.setError(shopperMessage(failure));
      current.setPhase("listening");
      return;
    }

    const remaining = REPLY_DELAY_MS - (performance.now() - startedAt);
    if (remaining > 0) await wait(remaining);
    if (replyToken.current !== token) return;

    setThinking(null);
    const current = useAssistantStore.getState();
    current.setContactFlow(reply.contactFlow);
    current.addMessage({
      role: "assistant",
      text: reply.text,
      products: reply.products,
      posts: reply.posts,
      orders: reply.orders,
      offers: reply.offers,
      links: reply.links,
      chips: reply.chips,
    });
    playReply(reply.text, token);

    const action = reply.action;
    if (action?.type === "navigate" || action?.type === "open-bag") {
      window.setTimeout(() => {
        if (replyToken.current !== token) return;
        requestClose(action.type === "navigate" ? { href: action.href } : { then: useCartStore.getState().open });
      }, LEAVE_DELAY_MS);
    }
  };

  const startDictation = () => {
    if (BUSY.has(useAssistantStore.getState().phase)) interrupt();
    bump();
    setError(null);
    dictation.start();
  };

  /** The welcome, once, as the content fades in */
  const addWelcome = () => {
    const state = useAssistantStore.getState();
    if (state.messages.length) return;
    state.addMessage({ role: "assistant", text: assistantCopy.welcome });
    playReply(assistantCopy.welcome, ++replyToken.current);
  };

  // ---------- Opening and closing ------------------------------------------------

  // The timelines call back after later renders: they read the newest callbacks through here
  const latest = useRef({ addWelcome, bump, closed: () => {} });
  useLayoutEffect(() => {
    latest.current = { addWelcome, bump, closed: () => setClosing(false) };
  });

  useGSAP(
    () => {
      const rootEl = root.current;
      const rippleEl = ripple.current;
      const stageEl = stage.current;
      const panelEl = panel.current;
      if (!rootEl || !rippleEl || !stageEl || !panelEl) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const hidden = getComputedStyle(rootEl).visibility === "hidden";
      timeline.current?.kill();
      const store = useAssistantStore.getState();

      if (isOpen) {
        const { x, y } = store.origin ?? { x: window.innerWidth - 48, y: window.innerHeight - 48 };
        const radius = rippleRadius(x, y, window.innerWidth, window.innerHeight);
        store.setPhase("entering");
        stageEl.removeAttribute("data-revealed");
        gsap.set(rootEl, {
          "--assistant-x": `${x}px`,
          "--assistant-y": `${y}px`,
          visibility: "visible",
          pointerEvents: "auto",
        });
        if (hidden) {
          gsap.set(rootEl, { "--assistant-r": "0px" });
          gsap.set(panelEl, { opacity: 0 });
        }
        const tl = gsap.timeline({
          onComplete: () => {
            // Fully open: no mask left to repaint while the orb moves
            stageEl.setAttribute("data-revealed", "");
            const current = useAssistantStore.getState();
            if (current.isOpen && current.phase === "entering") current.setPhase("listening");
            latest.current.bump();
          },
        });
        if (reduced) {
          gsap.set(rootEl, { "--assistant-r": `${radius}px` });
          tl.fromTo(rootEl, { opacity: hidden ? 0 : 1 }, { opacity: 1, duration: seconds(REDUCED_FADE_MS) }, 0)
            .to(panelEl, { opacity: 1, duration: seconds(REDUCED_FADE_MS) }, 0)
            .call(() => latest.current.addWelcome(), undefined, 0);
        } else {
          gsap.set(rootEl, { opacity: 1 });
          tl.to(rootEl, { "--assistant-r": `${radius}px`, duration: seconds(OPEN_MS), ease: "power2.inOut" }, 0)
            .fromTo(rippleEl, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: "power1.out" }, 0)
            .to(rippleEl, { opacity: 0, duration: 0.45, ease: "power1.in" }, 0.65)
            .to(panelEl, { opacity: 1, duration: seconds(FADE_MS), ease: "power1.out" }, seconds(CONTENT_DELAY_MS))
            .call(() => latest.current.addWelcome(), undefined, seconds(CONTENT_DELAY_MS));
        }
        timeline.current = tl;
        return;
      }

      if (hidden) return;
      store.setPhase("exiting");
      // Back into the launcher where it is now, from a radius that covers the screen even if the window
      // changed size while it was open
      const button = launcher.current?.getBoundingClientRect();
      const x = button?.width ? button.left + button.width / 2 : window.innerWidth - 48;
      const y = button?.width ? button.top + button.height / 2 : window.innerHeight - 48;
      gsap.set(rootEl, { "--assistant-x": `${x}px`, "--assistant-y": `${y}px`, pointerEvents: "none" });
      if (stageEl.hasAttribute("data-revealed")) {
        gsap.set(rootEl, { "--assistant-r": `${rippleRadius(x, y, window.innerWidth, window.innerHeight)}px` });
      }
      stageEl.removeAttribute("data-revealed");
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(rootEl, { visibility: "hidden" });
          useAssistantStore.getState().setPhase("idle");
          latest.current.closed();
        },
      });
      if (reduced) {
        tl.to(rootEl, { opacity: 0, duration: seconds(REDUCED_FADE_MS) });
      } else {
        tl.to(panelEl, { opacity: 0, duration: seconds(FADE_MS), ease: "power1.in" }, 0)
          .to(rootEl, { "--assistant-r": "0px", duration: seconds(CLOSE_MS), ease: "power2.inOut" }, 0)
          .fromTo(rippleEl, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.1)
          .to(rippleEl, { opacity: 0, duration: 0.3 }, 0.6);
      }
      timeline.current = tl;
    },
    { scope: root, dependencies: [isOpen] },
  );

  // ---------- While open ---------------------------------------------------------

  const lockScroll = useEffectEvent((locked: boolean) => {
    if (locked) lenis?.stop();
    else lenis?.start();
  });

  // The page behind goes inert and stops scrolling; on close, focus goes back where it was (the
  // launcher). Declared before the focus below, so a reopen's focus lands after this has run
  useEffect(() => {
    if (!isOpen) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Live regions (the toasts) stay announced
    const page = Array.from(document.body.children).filter(
      (el) =>
        el !== root.current && !el.hasAttribute("inert") && !el.hasAttribute("aria-live") && !UNTOUCHED.has(el.tagName),
    );
    page.forEach((el) => el.setAttribute("inert", ""));
    lockScroll(true);
    document.documentElement.style.overflow = "hidden";
    return () => {
      page.forEach((el) => el.removeAttribute("inert"));
      lockScroll(false);
      document.documentElement.style.overflow = "";
      opener?.focus({ preventScroll: true });
    };
  }, [isOpen]);

  // A pointer starts in the field; touch doesn't, so no keyboard pops up over the opening
  useEffect(() => {
    if (!isOpen) return;
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus();
    else panel.current?.focus({ preventScroll: true });
  }, [isOpen]);

  // Escape stops dictating first, then closes
  const onEscape = useEffectEvent(() => {
    if (dictation.isDictating) dictation.cancel();
    else requestClose();
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  // One history entry for the same URL, so Back closes the assistant instead of leaving the page
  const onHistoryBack = useEffectEvent(() => {
    historyEntry.current = false;
    stopEverything();
    finishClose();
  });

  useEffect(() => {
    if (!isOpen) return;
    if (!window.history.state?.savaAssistant) {
      window.history.pushState({ ...window.history.state, savaAssistant: true }, "");
    }
    historyEntry.current = true;
    const onPopState = (event: PopStateEvent) => {
      if (!event.state?.savaAssistant) onHistoryBack();
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [isOpen]);

  // Unmounting drops whatever was still on its way
  useEffect(
    () => () => {
      window.clearTimeout(idleTimer.current);
      window.clearTimeout(phaseTimer.current);
      replyToken.current++;
    },
    [],
  );

  // ---------- Render -------------------------------------------------------------

  const onClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    const href = internalHref(event);
    if (!href) return;
    event.preventDefault();
    requestClose({ href });
  };

  const busy = BUSY.has(phase);

  return createPortal(
    <div ref={root} data-lenis-prevent className="pointer-events-none invisible fixed inset-0 z-55">
      <div ref={ripple} aria-hidden="true" className="absolute inset-0 assistant-ripple opacity-0" />
      <div ref={stage} className="absolute inset-0 overflow-hidden assistant-stage text-ink">
        <div aria-hidden="true" className="absolute inset-0 bg-grain opacity-15 mix-blend-multiply" />
        <div
          ref={panel}
          id={ASSISTANT_DIALOG_ID}
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-title"
          tabIndex={-1}
          onClickCapture={onClickCapture}
          onPointerDown={bump}
          onKeyDown={bump}
          // z-1: a layer of its own, so the input's glow sits over the stage's colour
          className="relative z-1 flex h-full flex-col outline-none"
        >
          <div className="container flex h-header shrink-0 items-center justify-between gap-4">
            <h2 id="assistant-title" className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              SAVA Assistant
            </h2>
            <button
              type="button"
              onClick={() => requestClose()}
              aria-label="Close the assistant"
              className="group -mr-1 center size-10 shrink-0 rounded-full bg-paper shadow-sm shadow-navy/5 transition-colors hover:bg-mist"
            >
              <RiCloseLine
                aria-hidden="true"
                className="size-5 transition-transform duration-500 ease-out-expo group-hover:rotate-90"
              />
            </button>
          </div>
          <p aria-live="polite" className="sr-only">
            {dictation.isDictating ? "Listening" : ""}
          </p>

          <div className="container flex min-h-0 flex-1 flex-col-reverse gap-2 pb-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:pb-8">
            {/* The conversation: sized to its messages and centred beside the orb; on phones, under it,
                taking the room the orb gives up once the chat gets going */}
            <div
              className={cn(
                "flex min-h-0 w-full flex-col transition-[flex-grow] duration-300 lg:max-h-full lg:w-136",
                hasInteracted && "max-lg:grow",
              )}
            >
              <AssistantTranscript
                messages={messages}
                thinking={phase === "thinking" ? thinking : null}
                busy={busy}
                onChip={sendMessage}
                onRevealed={markRevealed}
              />
              {error && (
                <div
                  role="alert"
                  className="mb-3 flex items-start gap-2.5 rounded-2xl border border-sale/20 bg-paper/80 px-4 py-3 text-caption text-sale"
                >
                  <p className="flex-1">{error}</p>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    aria-label="Dismiss"
                    className="-my-1 -mr-2 center size-7 shrink-0 rounded-full transition-colors hover:bg-sale/10"
                  >
                    <RiCloseLine aria-hidden="true" className="size-4" />
                  </button>
                </div>
              )}
              <div className="flex flex-col gap-5">
                {!hasInteracted && messages.length > 0 && (
                  // One row that scrolls sideways on phones; centred and wrapping on wide screens
                  <div className="flex gap-2 max-lg:-mx-gutter max-lg:no-scrollbar max-lg:overflow-x-auto max-lg:fade-edges-x max-lg:px-gutter max-lg:py-1 lg:flex-wrap lg:justify-center">
                    {QUICK_ACTIONS.map((label, i) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => sendMessage(label)}
                        // One after another, as the welcome finishes arriving
                        style={{ animationDelay: `${1.2 + i * 0.06}s` }}
                        className={cn(assistantChip, "animate-fade-up")}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <AssistantInput
                  ref={input}
                  busy={busy}
                  onSubmit={sendMessage}
                  onStop={interrupt}
                  onDictate={startDictation}
                  onActivity={bump}
                  dictation={dictation}
                />
              </div>
            </div>

            {/* The orb: right on wide screens; on phones above the chat, shrinking once it gets going */}
            <div
              className={cn(
                "aspect-square shrink-0 self-center transition-[width] duration-300 lg:w-[min(32.5rem,46vw,calc(100svh-10rem))]",
                hasInteracted ? "max-lg:w-25" : "max-lg:my-auto max-lg:w-[min(20rem,80vw,42svh)]",
              )}
            >
              <AssistantOrb phase={phase} active={isOpen || closing} level={micLevel} />
            </div>
          </div>
        </div>

        {/* Round the screen's edges while dictating */}
        <div
          aria-hidden="true"
          data-visible={dictation.isDictating || undefined}
          className="pointer-events-none assistant-glow absolute inset-0 z-10 opacity-0 transition-opacity duration-450 data-visible:opacity-100 data-visible:delay-100 data-visible:duration-600"
        />
      </div>
    </div>,
    document.body,
  );
}
