"use client";

import { RiArrowRightUpLine, RiCheckLine, RiCloseLine, RiMicLine, RiStopFill } from "@remixicon/react";
import { useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import DictationWave from "@/components/assistant/DictationWave";
import type { Dictation } from "@/hooks/useDictation";
import { appendDictation } from "@/lib/assistant/dictation";
import { cn } from "@/utils/cn";

const MAX_LINES = 6;
const MAX_LENGTH = 2000;

const round = "center size-10 shrink-0 rounded-full transition-colors duration-300";
const primary = cn(round, "bg-accent text-paper hover:bg-navy disabled:pointer-events-none disabled:opacity-40");
const ghost = cn(round, "text-ink hover:bg-surface");

export interface AssistantInputHandle {
  focus: () => void;
  /** Puts dictated words after the field's text, without sending them */
  insert: (text: string) => void;
}

interface AssistantInputProps {
  ref?: React.Ref<AssistantInputHandle>;
  /** A reply is on its way: Send becomes Stop */
  busy: boolean;
  onSubmit: (text: string) => void;
  onStop: () => void;
  onDictate: () => void;
  /** Typing counts as activity (the orb stays awake) */
  onActivity: () => void;
  dictation: Dictation;
}

/**
 * The assistant's input: a white pill with a thin border, round which two arcs of SAVA blue keep
 * turning, once every 8s. Inside: the mic (where dictation works), a field
 * that grows to six lines (past one, the buttons drop below the text), and Send, which becomes Stop
 * while a reply is on its way. Dictating, the row becomes the waveform with Cancel and Insert.
 */
export default function AssistantInput({
  ref,
  busy,
  onSubmit,
  onStop,
  onDictate,
  onActivity,
  dictation,
}: AssistantInputProps) {
  const [value, setValue] = useState("");
  const form = useRef<HTMLFormElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);
  // The length the text had when it first ran onto a second line
  const multilineAt = useRef(0);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => field.current?.focus({ preventScroll: true }),
      insert: (text) => {
        setValue((current) => appendDictation(current, text).slice(0, MAX_LENGTH));
        requestAnimationFrame(() => field.current?.focus({ preventScroll: true }));
      },
    }),
    [],
  );

  // Fits the field to its text, up to six lines. Past one line the buttons drop below it (data-multiline
  // on the form), and stay there until the text is clearly shorter, so the layout doesn't flicker
  useLayoutEffect(() => {
    const textarea = field.current;
    const box = form.current;
    if (!box) return;
    if (!textarea) {
      box.removeAttribute("data-multiline");
      return;
    }
    const style = getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(style.lineHeight) || 22;
    const padding = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    const maxHeight = lineHeight * MAX_LINES + padding;
    const fit = () => {
      textarea.style.height = "auto";
      const height = textarea.scrollHeight;
      textarea.style.height = `${Math.min(height, maxHeight)}px`;
      textarea.style.overflowY = height > maxHeight ? "auto" : "hidden";
      return height;
    };
    // Lines counted rather than pixels compared: display scaling adds fractions of a pixel
    const lines = Math.round((fit() - padding) / lineHeight);
    const multiline = box.hasAttribute("data-multiline");
    if (!multiline && (value.includes("\n") || lines >= 2)) {
      multilineAt.current = value.length;
      box.setAttribute("data-multiline", "");
      fit();
    } else if (multiline && !value.includes("\n") && value.length < multilineAt.current - 2) {
      box.removeAttribute("data-multiline");
      fit();
    }
  }, [value, dictation.isDictating]);

  const submit = () => {
    const text = value.trim();
    if (!text || busy) return;
    onSubmit(text);
    setValue("");
  };

  return (
    <form
      ref={form}
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="group/input assistant-ring relative flex items-center gap-2 rounded-full bg-paper p-2 data-multiline:flex-wrap data-multiline:rounded-3xl"
    >
      {dictation.isDictating ? (
        <div className="flex min-w-0 flex-1 animate-fade-up items-center gap-2 pl-3">
          <DictationWave getLevel={dictation.getLevel} />
          <button type="button" aria-label="Cancel dictation" onClick={dictation.cancel} className={ghost}>
            <RiCloseLine aria-hidden="true" className="size-5" />
          </button>
          <button type="button" aria-label="Insert dictation" onClick={dictation.confirm} className={primary}>
            <RiCheckLine aria-hidden="true" className="size-5" />
          </button>
        </div>
      ) : (
        <>
          {dictation.supported && (
            <button
              type="button"
              aria-label="Dictate a message"
              onClick={onDictate}
              className={cn(ghost, "order-1 group-data-multiline/input:order-2 group-data-multiline/input:mr-auto")}
            >
              <RiMicLine aria-hidden="true" className="size-5" />
            </button>
          )}
          <textarea
            ref={field}
            rows={1}
            value={value}
            maxLength={MAX_LENGTH}
            placeholder="Ask me anything…"
            aria-label="Message the SAVA assistant"
            autoComplete="off"
            enterKeyHint="send"
            onChange={(event) => {
              setValue(event.target.value);
              onActivity();
            }}
            onKeyDown={(event) => {
              onActivity();
              // Enter sends; Shift+Enter starts a new line
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
            className={cn(
              "order-2 no-scrollbar min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-input text-ink outline-none group-data-multiline/input:order-1 group-data-multiline/input:basis-full placeholder:text-muted/70",
              !dictation.supported && "pl-4",
            )}
          />
          {busy ? (
            <button
              type="button"
              aria-label="Stop the reply"
              onClick={onStop}
              className={cn(primary, "order-3 ml-auto")}
            >
              <RiStopFill aria-hidden="true" className="size-4" />
            </button>
          ) : (
            <button
              type="submit"
              aria-label="Send message"
              disabled={!value.trim()}
              className={cn(primary, "order-3 ml-auto")}
            >
              <RiArrowRightUpLine aria-hidden="true" className="size-5" />
            </button>
          )}
        </>
      )}
    </form>
  );
}
