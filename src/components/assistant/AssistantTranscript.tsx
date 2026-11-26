"use client";

import {
  RiArrowDownLine,
  RiArrowLeftSLine,
  RiArrowRightLine,
  RiArrowRightSLine,
  RiCheckLine,
  RiFileCopyLine,
} from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import Price from "@/components/ui/Price";
import Sparkle from "@/components/ui/Sparkle";
import { revealDuration, type OfferLine, type OrderLine, type ReplyLink } from "@/lib/assistant/replies";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import type { AssistantMessage } from "@/store/assistant-store";
import type { SearchPost, SearchProduct } from "@/types";
import { cn } from "@/utils/cn";
import { blogHref, productHref } from "@/utils/url";

/** A suggestion to tap: a frosted pill on the assistant's light stage */
export const assistantChip =
  "inline-flex h-9 shrink-0 items-center rounded-full bg-paper/70 px-4 text-caption whitespace-nowrap text-ink ring-1 ring-paper backdrop-blur-sm transition-colors duration-300 hover:bg-paper hover:text-accent";

/** A frosted card under a reply: a product, a post, an order, an offer */
const card = "rounded-2xl bg-paper/80 ring-1 ring-paper backdrop-blur-sm transition-colors duration-300";

/** Each letter arrives in this long */
const LETTER_S = 0.35;
/** Within this distance of the end, the conversation follows new messages down */
const STICK_PX = 32;
/** Scrolled further up than this, "Scroll to latest" appears */
const JUMP_PX = 120;
const COPIED_MS = 2000;

/**
 * A reply's words, shown line by line. Unrevealed, they arrive letter by letter, each in SAVA blue
 * settling to the text colour, then `onRevealed`; after that (reopening, or reduced motion) they're
 * simply there. Screen readers get the words from a hidden copy beside it: this one is aria-hidden.
 */
function RevealText({ text, animate, onRevealed }: { text: string; animate: boolean; onRevealed: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(onRevealed);

  useEffect(() => {
    done.current = onRevealed;
  });

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      // A block per line, so a reply's line breaks hold (the message summary)
      el.replaceChildren(
        ...text.split("\n").map((line) => {
          const span = document.createElement("span");
          span.className = "block";
          span.textContent = line || " ";
          return span;
        }),
      );
      if (!animate) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const split = new SplitText(Array.from(el.children), { type: "words,chars", aria: "none" });
        const accent = getComputedStyle(document.documentElement).getPropertyValue("--color-accent").trim();
        const total = revealDuration(text) / 1000;
        gsap.fromTo(
          split.chars,
          { opacity: 0, color: accent },
          {
            opacity: 1,
            color: getComputedStyle(el).color,
            duration: LETTER_S,
            ease: "power1.out",
            stagger: split.chars.length > 1 ? Math.max(0, total - LETTER_S) / split.chars.length : 0,
            onComplete: () => {
              split.revert();
              done.current();
            },
          },
        );
      });
    },
    { scope: ref, dependencies: [text, animate] },
  );

  return <span ref={ref} aria-hidden="true" className="block" />;
}

/** The carousel's arrows: over the cards, level with their photos, gone when there's nothing that way */
const arrow =
  "absolute top-20 z-1 center size-9 -translate-y-1/2 rounded-full bg-paper text-ink shadow-md ring-1 shadow-navy/10 ring-line transition-[opacity,color] duration-300 hover:text-accent disabled:pointer-events-none disabled:opacity-0";
/** How far the row's edges fade where more cards wait (the row's scroll-pl-8 snaps cards clear of it) */
const FADE = "2rem";

/**
 * Suggested products in a row that scrolls sideways (swipe, trackpad, or the arrows, a card at a
 * time), snapping to each card. An arrow shows only while there are cards that way, and that edge
 * of the row fades.
 */
function ProductCards({ products }: { products: SearchProduct[] }) {
  const id = useId();
  const row = useRef<HTMLUListElement>(null);
  const back = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const [more, setMore] = useState({ back: false, next: false });

  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () => {
      const end = el.scrollWidth - el.clientWidth;
      const canBack = el.scrollLeft > 2;
      const canNext = el.scrollLeft < end - 2;
      // An arrow with focus that runs out of cards hands it to the other, rather than dropping it
      if (!canBack && document.activeElement === back.current) next.current?.focus({ preventScroll: true });
      if (!canNext && document.activeElement === next.current) back.current?.focus({ preventScroll: true });
      setMore((current) =>
        current.back === canBack && current.next === canNext ? current : { back: canBack, next: canNext },
      );
    };
    measure();
    el.addEventListener("scroll", measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, []);

  /** One card (and the gap after it) back or on */
  const step = (direction: 1 | -1) => {
    const el = row.current;
    const first = el?.firstElementChild;
    if (!el || !(first instanceof HTMLElement)) return;
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * (first.offsetWidth + gap), behavior: smooth ? "smooth" : "auto" });
  };

  const mask = `linear-gradient(90deg, transparent, #000 ${more.back ? FADE : "0px"}, #000 calc(100% - ${more.next ? FADE : "0px"}), transparent)`;

  return (
    <div className="relative w-full">
      <ul
        id={id}
        ref={row}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="no-scrollbar flex snap-x snap-mandatory scroll-pl-8 gap-2 overflow-x-auto overscroll-x-contain"
      >
        {products.map((product) => (
          <li key={product.slug} className="w-40 shrink-0 snap-start">
            <Link
              href={productHref(product.slug)}
              className={cn(card, "group/card flex h-full flex-col gap-2 p-2 hover:bg-paper")}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  sizes="10rem"
                  // As on the listing card: the shot's white backdrop takes the tint
                  className="object-cover mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover/card:scale-105"
                />
              </div>
              <div className="flex flex-col gap-0.5 px-1 pb-1">
                <p className="text-h6">{product.name}</p>
                {product.scent && <p className="text-caption text-muted">{product.scent}</p>}
                <Price price={product.price} compareAt={product.compareAt} className="text-caption font-medium" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <button
        ref={back}
        type="button"
        aria-label="Previous products"
        aria-controls={id}
        disabled={!more.back}
        onClick={() => step(-1)}
        className={cn(arrow, "left-2")}
      >
        <RiArrowLeftSLine aria-hidden="true" className="size-5" />
      </button>
      <button
        ref={next}
        type="button"
        aria-label="More products"
        aria-controls={id}
        disabled={!more.next}
        onClick={() => step(1)}
        className={cn(arrow, "right-2")}
      >
        <RiArrowRightSLine aria-hidden="true" className="size-5" />
      </button>
    </div>
  );
}

function PostLinks({ posts }: { posts: SearchPost[] }) {
  return (
    <ul className="flex w-full flex-col gap-2">
      {posts.map((post) => (
        <li key={post.slug}>
          <Link href={blogHref(post.slug)} className={cn(card, "flex items-center gap-3 p-2 pr-4 hover:bg-paper")}>
            <div className="relative aspect-4/3 w-20 shrink-0 overflow-hidden rounded-xl bg-surface">
              <Image
                src={post.image.src}
                alt=""
                fill
                sizes="5rem"
                style={{ objectPosition: post.image.position }}
                className="object-cover"
              />
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-micro text-muted">Sweat School · {post.category}</p>
              <p className="text-h6">{post.title}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function OrderRows({ orders }: { orders: OrderLine[] }) {
  return (
    <ul className="flex w-full flex-col gap-2">
      {orders.map((order) => (
        <li key={order.id}>
          <Link
            href={order.href}
            className={cn(card, "flex items-center justify-between gap-4 px-4 py-3 tabular-nums hover:bg-paper")}
          >
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-h6">{order.title}</p>
              <p className="flex flex-wrap items-center gap-2 text-caption text-muted">
                {order.date}
                {/* As on the account's Orders tab */}
                {order.status && (
                  <span className="rounded-full bg-mist/60 px-3 py-0.5 text-eyebrow text-navy">{order.status}</span>
                )}
              </p>
            </div>
            <span className="shrink-0 text-body font-medium">{order.total}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function OfferRows({ offers }: { offers: OfferLine[] }) {
  const [copied, setCopied] = useState("");

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      window.setTimeout(() => setCopied((current) => (current === code ? "" : current)), COPIED_MS);
    } catch {
      setCopied("");
    }
  };

  return (
    <ul className="flex w-full flex-col gap-2">
      {offers.map((offer) => (
        <li key={offer.code} className={cn(card, "flex items-center justify-between gap-4 px-4 py-3")}>
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="text-h6">{offer.title}</p>
            {offer.detail && <p className="text-caption text-muted">{offer.detail}</p>}
          </div>
          <button
            type="button"
            onClick={() => copy(offer.code)}
            aria-label={`Copy the code ${offer.code}`}
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-dashed border-accent px-3.5 text-eyebrow text-accent transition-colors duration-300 hover:bg-accent hover:text-paper"
          >
            {copied === offer.code ? (
              <RiCheckLine aria-hidden="true" className="size-3.5" />
            ) : (
              <RiFileCopyLine aria-hidden="true" className="size-3.5" />
            )}
            {copied === offer.code ? "Copied" : offer.code}
          </button>
        </li>
      ))}
    </ul>
  );
}

function Links({ links }: { links: ReplyLink[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={`${link.href}-${link.label}`}
          href={link.href}
          className="group/link inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/15 px-4 text-caption transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
        >
          {link.label}
          <RiArrowRightLine
            aria-hidden="true"
            className="size-3.5 transition-transform duration-500 ease-out-expo group-hover/link:translate-x-0.5"
          />
        </Link>
      ))}
    </div>
  );
}

interface MessageProps {
  message: AssistantMessage;
  /** The latest reply, whose follow-up chips show */
  showChips: boolean;
  animate: boolean;
  onChip: (text: string) => void;
  onRevealed: (id: string) => void;
}

function Message({ message, showChips, animate, onChip, onRevealed }: MessageProps) {
  if (message.role === "user") {
    return (
      <p className="max-w-[88%] self-end rounded-3xl rounded-br-md bg-linear-135 from-accent from-[-40%] to-navy to-120% px-4 py-2.5 text-body whitespace-pre-wrap text-paper">
        {message.text}
      </p>
    );
  }

  const chips = showChips ? (message.chips ?? []) : [];
  const extras =
    Boolean(message.products?.length) ||
    Boolean(message.posts?.length) ||
    Boolean(message.orders?.length) ||
    Boolean(message.offers?.length) ||
    Boolean(message.links?.length) ||
    chips.length > 0;

  return (
    <>
      {message.text && (
        <p className="max-w-[88%] self-start rounded-3xl rounded-bl-md bg-paper/80 px-4 py-2.5 text-body text-ink shadow-sm ring-1 shadow-navy/5 ring-paper backdrop-blur-sm">
          <span className="sr-only">{message.text}</span>
          <RevealText text={message.text} animate={animate} onRevealed={() => onRevealed(message.id)} />
        </p>
      )}
      {extras && (
        // Rises in as the words finish arriving
        <div
          className={cn(
            "flex w-full max-w-[88%] flex-col items-start gap-2.5 self-start",
            animate && "animate-fade-up",
          )}
          style={animate ? { animationDelay: `${revealDuration(message.text)}ms` } : undefined}
        >
          {message.products?.length ? <ProductCards products={message.products} /> : null}
          {message.posts?.length ? <PostLinks posts={message.posts} /> : null}
          {message.orders?.length ? <OrderRows orders={message.orders} /> : null}
          {message.offers?.length ? <OfferRows offers={message.offers} /> : null}
          {message.links?.length ? <Links links={message.links} /> : null}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button key={chip} type="button" onClick={() => onChip(chip)} className={assistantChip}>
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

interface AssistantTranscriptProps {
  messages: AssistantMessage[];
  /** The line shown while a reply is on its way */
  thinking: string | null;
  /** A reply is on its way: the last reply's chips step aside */
  busy: boolean;
  onChip: (text: string) => void;
  onRevealed: (id: string) => void;
}

/**
 * The conversation: the shopper's messages on the right in SAVA blue, the assistant's on the left,
 * frosted, with whatever a reply carries beneath it. New messages come into view unless the shopper
 * has scrolled up, when "Scroll to latest" appears instead. The ends fade rather than cut off.
 */
export default function AssistantTranscript({
  messages,
  thinking,
  busy,
  onChip,
  onRevealed,
}: AssistantTranscriptProps) {
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const [jump, setJump] = useState(false);

  // New messages come into view…
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages.length, thinking]);

  // …and so do replies that grow as they reveal, or as their images load
  useEffect(() => {
    const el = scroller.current;
    if (!el || !list.current) return;
    const observer = new ResizeObserver(() => {
      if (stick.current) el.scrollTop = el.scrollHeight;
    });
    observer.observe(list.current);
    return () => observer.disconnect();
  }, []);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    stick.current = distance < STICK_PX;
    setJump(distance > JUMP_PX);
  };

  const toLatest = () => {
    const el = scroller.current;
    if (!el) return;
    stick.current = true;
    setJump(false);
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  };

  const lastReply = messages.findLastIndex((message) => message.role === "assistant");

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={scroller}
        role="log"
        aria-label="Conversation"
        onScroll={onScroll}
        // before:flex-1: the messages gather at the bottom, as in any chat
        className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain fade-edges-y py-6 before:flex-1"
      >
        <div ref={list} className="flex flex-col gap-3">
          {messages.map((message, i) => (
            <Message
              key={message.id}
              message={message}
              showChips={!busy && i === lastReply}
              animate={message.role === "assistant" && !message.revealed}
              onChip={onChip}
              onRevealed={onRevealed}
            />
          ))}
          {thinking && (
            <p className="flex items-center gap-2 self-start rounded-3xl rounded-bl-md bg-paper/60 px-4 py-2.5 text-caption text-muted italic">
              <Sparkle className="animate-pulse text-accent" />
              {thinking}
            </p>
          )}
        </div>
      </div>
      {jump && (
        <button
          type="button"
          onClick={toLatest}
          aria-label="Scroll to latest"
          className="absolute bottom-2 left-1/2 center size-9 -translate-x-1/2 animate-fade-up rounded-full bg-paper text-ink shadow-md ring-1 shadow-navy/10 ring-line transition-colors hover:text-accent"
        >
          <RiArrowDownLine aria-hidden="true" className="size-4" />
        </button>
      )}
    </div>
  );
}
