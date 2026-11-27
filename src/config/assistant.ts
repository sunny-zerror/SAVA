/*
 * The shopping assistant: the SAVA-blue button at the bottom right of every page, which opens a
 * full-screen chat (src/components/assistant/). Its answers are scripted from the store's own copy
 * and data (src/lib/assistant/replies.ts, where all its reply copy lives), so it sends nothing
 * anywhere the pages don't already.
 */
export const assistantConfig = {
  /** false takes it off every page */
  enabled: true,
  /** It never shows on these paths, or anything under them: checkout keeps the shopper on the order */
  hiddenPaths: ["/checkout"],
  /** The launcher's speech bubble on hover (and keyboard focus)… */
  hoverBubble: "Hi there! How can I help you?",
  /** …and once a visit, a few seconds after the page has loaded, unless it's already been opened */
  introBubble: "Hi! I'm your personal shopping assistant. I'm here to help you explore SAVA.",
  introDelayMs: 5000,
  introShowMs: 5000,
  /** The orb dims and slows after this long without activity, and wakes on the next */
  sleepMs: 45000,
};

/** The dialog the launcher opens (its aria-controls) */
export const ASSISTANT_DIALOG_ID = "assistant-dialog";

/** Whether the assistant stays off this page */
export const isAssistantHidden = (pathname: string) =>
  !assistantConfig.enabled ||
  assistantConfig.hiddenPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
