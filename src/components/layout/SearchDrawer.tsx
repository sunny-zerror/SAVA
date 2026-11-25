"use client";

import { RiArrowRightLine, RiCloseLine, RiLoader4Line, RiSearchLine } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BlobButton from "@/components/ui/BlobButton";
import Drawer from "@/components/ui/Drawer";
import { fieldClass } from "@/components/ui/field-class";
import Price from "@/components/ui/Price";
import Sparkle from "@/components/ui/Sparkle";
import { searchConfig } from "@/config/shop";
import { useDrawerMotion } from "@/hooks/useDrawerMotion";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSearchStore } from "@/store/search-store";
import type { SearchPost, SearchProduct, SearchResults } from "@/types";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";
import { blogHref, productHref } from "@/utils/url";

/** Wait after the last keystroke before searching */
const DEBOUNCE_MS = 180;

const kicker = "flex items-center gap-2 text-kicker text-accent";

/** A block that rises into its own overflow-hidden mask with the drawer's content (useDrawerMotion) */
function Line({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden">
      <div data-drawer-line className={className}>
        {children}
      </div>
    </div>
  );
}

/**
 * Wraps content that can appear while the drawer is open (results for a new term, the suggestions
 * when the field is cleared): mounted then (`live`), its lines rise, its hairlines draw out and its
 * extras fade up by themselves, as the drawer's own opening would have done. Mounted while the drawer
 * is shut, it waits for that opening instead.
 */
function Rise({
  live,
  as: Tag = "div",
  delay = 0,
  className,
  children,
}: {
  live: boolean;
  as?: "div" | "li";
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const root = useRef<HTMLDivElement & HTMLLIElement>(null);
  useGSAP(
    () => {
      if (!live) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        const q = gsap.utils.selector(root);
        const [rules, lines, extras] = ["[data-drawer-rule]", "[data-drawer-line]", "[data-drawer-extra]"].map(q);
        const tl = gsap.timeline({ delay, defaults: { ease: "expo.out", overwrite: "auto" } });
        // Only the kinds this block holds (a row has no extras): GSAP warns about an empty target
        if (rules.length)
          tl.fromTo(
            rules,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1.2, stagger: 0.06 },
            0,
          );
        if (lines.length) tl.fromTo(lines, { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06 }, 0);
        if (extras.length)
          tl.fromTo(extras, { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.04 }, 0.1);
      });
    },
    { scope: root },
  );
  return (
    <Tag ref={root} className={className}>
      {children}
    </Tag>
  );
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** The text with each searched word in SAVA blue */
function Highlight({ text, words }: { text: string; words: string[] }) {
  if (!words.length) return text;
  const parts = text.split(new RegExp(`(${words.map(escapeRegExp).join("|")})`, "gi"));
  // split() with a capturing group: the matches sit at the odd indexes
  return parts.map((part, i) =>
    i % 2 ? (
      <mark key={i} className="bg-transparent text-accent">
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

/** A row's arrow, sliding in on hover as the menu's do */
function RowArrow() {
  return (
    <RiArrowRightLine
      aria-hidden="true"
      className="size-5 shrink-0 -translate-x-3 text-accent opacity-0 transition-[opacity,translate] duration-500 ease-out-expo group-hover/row:translate-x-0 group-hover/row:opacity-100"
    />
  );
}

/** Between hairlines, like the bag's rows: thumbnail, name and scent, price. The row opens the product */
function ProductRow({
  product,
  words,
  onNavigate,
}: {
  product: SearchProduct;
  words: string[];
  onNavigate: () => void;
}) {
  return (
    <>
      <span aria-hidden="true" data-drawer-rule className="absolute inset-x-0 bottom-0 h-px bg-line" />
      <Line className="group/row relative flex items-center gap-4 py-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface">
          <Image
            src={product.image}
            alt=""
            fill
            sizes="80px"
            // As on the listing card: the shot's white backdrop takes the tint
            className="object-cover mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover/row:scale-108"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-h6">
            {/* Stretched link: the whole row opens the product */}
            <Link href={productHref(product.slug)} onClick={onNavigate} className="after:absolute after:inset-0">
              <Highlight text={product.name} words={words} />
            </Link>
          </p>
          {product.scent && (
            <p className="text-caption text-muted">
              <Highlight text={product.scent} words={words} />
            </p>
          )}
          <Price price={product.price} compareAt={product.compareAt} className="text-body font-medium" />
        </div>
        <RowArrow />
      </Line>
    </>
  );
}

/** A Sweat School post: its photo, category and date, title */
function PostRow({ post, words, onNavigate }: { post: SearchPost; words: string[]; onNavigate: () => void }) {
  return (
    <>
      <span aria-hidden="true" data-drawer-rule className="absolute inset-x-0 bottom-0 h-px bg-line" />
      <Line className="group/row relative flex items-center gap-4 py-4">
        <div className="relative aspect-4/3 w-24 shrink-0 overflow-hidden rounded-2xl bg-surface">
          <Image
            src={post.image.src}
            alt=""
            fill
            sizes="96px"
            style={{ objectPosition: post.image.position }}
            className="object-cover transition-transform duration-700 ease-out-expo group-hover/row:scale-108"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-caption text-muted">
            {post.category} · <time dateTime={post.date}>{formatDate(post.date)}</time>
          </p>
          <p className="text-h6">
            <Link href={blogHref(post.slug)} onClick={onNavigate} className="after:absolute after:inset-0">
              <Highlight text={post.title} words={words} />
            </Link>
          </p>
        </div>
        <RowArrow />
      </Line>
    </>
  );
}

interface SectionProps {
  id: string;
  title: string;
  count?: number;
  /** A "View all" link beside the heading */
  href?: string;
  live: boolean;
  onNavigate: () => void;
  children: React.ReactNode;
}

/** "✦ PRODUCTS (4)" over a hairline, then its rows */
function Section({ id, title, count, href, live, onNavigate, children }: SectionProps) {
  return (
    <section aria-labelledby={id}>
      <Rise live={live}>
        <Line className="flex items-baseline justify-between gap-4 pb-2">
          <h3 id={id} className={kicker}>
            <Sparkle />
            {title}
            {count != null && <span className="text-muted tabular-nums">({count})</span>}
          </h3>
          {href && (
            <Link href={href} onClick={onNavigate} className="link-underline text-caption text-muted hover:text-ink">
              View all
            </Link>
          )}
        </Line>
        <span aria-hidden="true" data-drawer-rule className="block h-px bg-line" />
      </Rise>
      <ul className="flex flex-col">{children}</ul>
    </section>
  );
}

/** Suggested terms as pills, like the blog's category pills; picking one searches for it */
function Terms({ onPick }: { onPick: (term: string) => void }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {searchConfig.popular.map((term) => (
        <li key={term} data-drawer-extra>
          <button
            type="button"
            onClick={() => onPick(term)}
            className="inline-flex h-10 items-center rounded-full bg-surface px-4 text-cta transition-colors duration-300 hover:bg-mist"
          >
            {term}
          </button>
        </li>
      ))}
    </ul>
  );
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

/** "View 1 product", "View all 4 products" */
const viewAll = (count: number, word: string) => `View ${count === 1 ? "" : "all "}${plural(count, word)}`;

interface SearchDrawerProps {
  /** Shown before anything's typed: products to start from, and the latest posts (SiteLayout) */
  products: SearchProduct[];
  posts: SearchPost[];
}

/**
 * The site search, behind the header's Search button (and ⌘K / Ctrl+K): a panel that drops from the top,
 * as wide as the page, its content between the frame's rails like the header's. The field leads,
 * focused as the panel opens. Before anything's typed it offers popular terms, then the range and the
 * latest Sweat School posts side by side (stacked on phones); as you type, matching products and posts come in
 * in two columns the same way (from /api/search, each new row rising into place), the words found
 * picked out in SAVA blue. Enter —
 * or the blue button — opens the full results: the shop's, or the blog's when only posts match. It
 * moves like the menu and the bag (useDrawerMotion), and starts afresh each time it opens.
 */
export default function SearchDrawer({ products, posts }: SearchDrawerProps) {
  const router = useRouter();
  const isOpen = useSearchStore((s) => s.isOpen);
  const open = useSearchStore((s) => s.open);
  const close = useSearchStore((s) => s.close);
  const { scope, shown, requestClose } = useDrawerMotion({ open: isOpen, onClose: close });
  const field = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState("");
  // Results by term, kept so going back a letter is instant; and the last term that came back,
  // shown (dimmed) while the next one loads
  const [cache, setCache] = useState<Record<string, SearchResults>>({});
  const [lastTerm, setLastTerm] = useState("");
  const [failedTerm, setFailedTerm] = useState("");

  // Starts afresh each time: the field is cleared once the panel has gone
  const [wasShown, setWasShown] = useState(shown);
  if (shown !== wasShown) {
    setWasShown(shown);
    if (!shown) {
      setQuery("");
      setLastTerm("");
    }
  }

  const term = query.trim().replace(/\s+/g, " ").toLowerCase();
  const words = term.split(" ").filter(Boolean);
  const searching = term.length >= searchConfig.minLength;
  const found = searching ? cache[term] : undefined;
  const failed = searching && !found && failedTerm === term;
  const loading = searching && !found && !failed;
  // Stale while loading: the last results stay up, dimmed
  const results = found ?? (searching && !failed ? cache[lastTerm] : undefined);

  useEffect(() => {
    if (!searching || cache[term]) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        if (!response.ok) throw new Error(`Search failed (${response.status})`);
        const data: SearchResults = await response.json();
        setCache((current) => ({ ...current, [term]: data }));
        setLastTerm(term);
      } catch (error) {
        // A newer keystroke took over
        if (controller.signal.aborted) return;
        console.error("[search]", error);
        setFailedTerm(term);
      }
    }, DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [term, searching, cache]);

  // ⌘K / Ctrl+K opens it from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pick = (value: string) => {
    setQuery(value);
    field.current?.focus();
  };

  const shopHref = `/shop?q=${encodeURIComponent(query.trim())}`;
  const blogsHref = `/blogs?q=${encodeURIComponent(query.trim())}`;
  // Only posts match: the blog's results are the better page
  const postsOnly = !!results && results.productCount === 0 && results.postCount > 0;

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!term) {
      field.current?.focus();
      return;
    }
    router.push(postsOnly && found ? blogsHref : shopHref);
    requestClose();
  };

  const hasResults = !!results && (results.products.length > 0 || results.posts.length > 0);
  // Said only once this term's own results are in, never off the last term's
  const empty = !!found && found.productCount === 0 && found.postCount === 0;
  const status = !found
    ? ""
    : empty
      ? `No results for ${query.trim()}`
      : `${[
          found.productCount > 0 && plural(found.productCount, "product"),
          found.postCount > 0 && plural(found.postCount, "article"),
        ]
          .filter(Boolean)
          .join(" and ")} found`;

  const footer =
    results && hasResults ? (
      <Rise live={shown}>
        {/* At the right, as wide as the bag's Checkout rather than the page */}
        <div data-drawer-extra className="flex justify-end">
          <div className="w-full sm:w-80">
            <BlobButton href={postsOnly ? blogsHref : shopHref} onClick={requestClose} block>
              {postsOnly ? viewAll(results.postCount, "article") : viewAll(results.productCount, "product")}
            </BlobButton>
          </div>
        </div>
      </Rise>
    ) : null;

  return (
    <Drawer
      name="search-drawer"
      open={shown}
      onClose={requestClose}
      title="Search"
      side="top"
      initialFocus={field}
      heading={
        <h2 className={kicker}>
          <Sparkle />
          Search
        </h2>
      }
      footer={footer}
    >
      <div ref={scope} className="flex flex-col">
        {/* Stays at the top while the results scroll under it */}
        <div className="sticky top-0 z-10 -mx-inset bg-paper px-inset pt-6 pb-5">
          {/* The mask gives the field's focus ring room */}
          <div className="-m-1 overflow-hidden p-1">
            <div data-drawer-line>
              {/* A plain GET form to /shop?q=: Enter still searches the shop if the script hasn't run */}
              <form action="/shop" role="search" onSubmit={submit} className="flex items-center gap-2">
                <label htmlFor="site-search" className="sr-only">
                  Search products and articles
                </label>
                <div className="relative min-w-0 flex-1">
                  <input
                    ref={field}
                    id="site-search"
                    type="search"
                    name="q"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Sticks, scents, articles…"
                    autoComplete="off"
                    spellCheck={false}
                    enterKeyHint="search"
                    // pr-11: room for the clear button, standing in for the browser's own (hidden)
                    className={cn(fieldClass, "rounded-full pr-11 [&::-webkit-search-cancel-button]:hidden")}
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => pick("")}
                      aria-label="Clear search"
                      className="absolute inset-y-0 right-1 center w-10 text-muted transition-colors hover:text-ink"
                    >
                      <RiCloseLine aria-hidden="true" className="size-4.5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  aria-label="Search"
                  className="center size-12 shrink-0 rounded-full bg-accent text-paper transition-colors duration-300 hover:bg-navy"
                >
                  {loading ? (
                    <RiLoader4Line aria-hidden="true" className="size-5 animate-spin" />
                  ) : (
                    <RiSearchLine aria-hidden="true" className="size-5" />
                  )}
                </button>
              </form>
            </div>
          </div>
          <span aria-hidden="true" data-drawer-rule className="absolute inset-x-0 bottom-0 h-px bg-line" />
        </div>

        <p role="status" className="sr-only">
          {status}
        </p>

        {failed ? (
          <Rise live={shown} className="flex flex-col gap-2 py-10">
            <Line className="flex flex-col gap-2">
              <p className="text-h4">Search isn&apos;t working right now</p>
              <p className="text-body text-muted">Press Enter to search the shop instead.</p>
            </Line>
          </Rise>
        ) : empty ? (
          <Rise live={shown} className="flex flex-col gap-6 py-10">
            <Line className="flex flex-col gap-2">
              <p className="text-h4">No results for “{query.trim()}”</p>
              <p className="text-body text-muted">Check the spelling, or try one of these.</p>
            </Line>
            <Terms onPick={pick} />
          </Rise>
        ) : results && hasResults ? (
          <div
            className={cn(
              "grid gap-8 py-8 transition-opacity duration-300 lg:gap-x-16",
              // Products and posts side by side when both match
              results.products.length > 0 && results.posts.length > 0 && "lg:grid-cols-2",
              loading && "opacity-50",
            )}
          >
            {results.products.length > 0 && (
              <Section
                id="search-products"
                title="Products"
                count={results.productCount}
                live={shown}
                onNavigate={requestClose}
              >
                {results.products.map((product, i) => (
                  <Rise key={product.slug} as="li" live={shown} delay={i * 0.05} className="relative">
                    <ProductRow product={product} words={words} onNavigate={requestClose} />
                  </Rise>
                ))}
              </Section>
            )}
            {results.posts.length > 0 && (
              <Section
                id="search-posts"
                title="Sweat School"
                count={results.postCount}
                // The footer leads to the shop's results when products match too
                href={!postsOnly && results.postCount > results.posts.length ? blogsHref : undefined}
                live={shown}
                onNavigate={requestClose}
              >
                {results.posts.map((post, i) => (
                  <Rise key={post.slug} as="li" live={shown} delay={i * 0.05} className="relative">
                    <PostRow post={post} words={words} onNavigate={requestClose} />
                  </Rise>
                ))}
              </Section>
            )}
          </div>
        ) : (
          // Nothing typed yet (or the first search still loading, dimmed)
          <Rise
            live={shown}
            className={cn("flex flex-col gap-8 py-8 transition-opacity duration-300", loading && "opacity-50")}
          >
            <section aria-labelledby="search-popular" className="flex flex-col gap-4">
              <Line>
                <h3 id="search-popular" className={kicker}>
                  <Sparkle />
                  Popular searches
                </h3>
              </Line>
              <Terms onPick={pick} />
            </section>
            <div className={cn("grid gap-8 lg:gap-x-16", products.length > 0 && posts.length > 0 && "lg:grid-cols-2")}>
              {products.length > 0 && (
                <Section id="search-range" title="Shop the range" href="/shop" live={false} onNavigate={requestClose}>
                  {products.map((product) => (
                    <li key={product.slug} className="relative">
                      <ProductRow product={product} words={[]} onNavigate={requestClose} />
                    </li>
                  ))}
                </Section>
              )}
              {posts.length > 0 && (
                <Section
                  id="search-latest"
                  title="From Sweat School"
                  href="/blogs"
                  live={false}
                  onNavigate={requestClose}
                >
                  {posts.map((post) => (
                    <li key={post.slug} className="relative">
                      <PostRow post={post} words={[]} onNavigate={requestClose} />
                    </li>
                  ))}
                </Section>
              )}
            </div>
          </Rise>
        )}
      </div>
    </Drawer>
  );
}
