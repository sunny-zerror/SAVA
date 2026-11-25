import { RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";
import { cn } from "@/utils/cn";

/** accent — SAVA blue · light — white, for the dark gradient · soft — pale blue, a secondary action beside an accent one */
type Tone = "accent" | "light" | "soft";

// Solid fills only: the goo filter's alpha threshold would render a translucent one fully opaque anyway
const tones: Record<Tone, { fill: string; text: string }> = {
  accent: { fill: "bg-accent", text: "text-paper" },
  light: { fill: "bg-paper", text: "text-ink" },
  soft: { fill: "bg-mist", text: "text-ink" },
};

const GOO_FILTER_ID = "blob-button-goo";

/**
 * The SVG "goo" filter behind BlobButton's liquid hover: a blur, then a hard alpha threshold,
 * so shapes that come close melt together and pull apart with a stretching neck.
 * Rendered once per page by SiteLayout.
 */
export function BlobButtonFilter() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute size-0">
      <filter id={GOO_FILTER_ID} x="-20%" y="-50%" width="140%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        {/* Alpha × 20 − 9: blurred edges snap back to solid; a gap over ~6px stays open */}
        <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" />
      </filter>
    </svg>
  );
}

interface BlobOptions {
  tone?: Tone;
  /** Shown in the disc on hover; defaults to an arrow */
  icon?: React.ReactNode;
  /**
   * Fill the container's width. At rest the pill spans it all; on hover the pill draws in from the
   * right and the disc melts out into the space it leaves, all inside the button's own box.
   */
  block?: boolean;
  /** A spinner in place of the label (which keeps its room) while an action runs; the button is disabled */
  loading?: boolean;
}

/** With `href`, a link (next/link) */
type BlobLinkProps = BlobOptions & React.ComponentProps<typeof Link>;
/** Without, a <button> — type "button" unless given */
type BlobActionProps = BlobOptions & React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: never };
export type BlobButtonProps = BlobLinkProps | BlobActionProps;

const spring = "duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]";
// Disabled buttons and aria-disabled links fade and stop taking the pointer, so they don't melt either
const inert =
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

/**
 * SAVA's one button, for links and actions alike. At rest it's a plain pill; on hover a disc
 * stretches out of its right end like liquid, snaps free a small gap away and the icon pops in.
 * The disc overflows the button's box (so the pill keeps its size and centring): leave about 4rem
 * after a button that has another beside it — or use `block`, which keeps it all inside.
 */
// One signature each, so a click handler is typed for the element it's on
export default function BlobButton(props: BlobLinkProps): React.JSX.Element;
export default function BlobButton(props: BlobActionProps): React.JSX.Element;
export default function BlobButton(props: BlobButtonProps) {
  const { tone = "accent", icon, block, loading, className, children, ...rest } = props;
  const t = tones[tone];
  const revealed = "group-hover:translate-x-0 group-focus-visible:translate-x-0";
  const disc = icon ?? <RiArrowRightLine className="size-4" />;

  const spinner = loading && (
    <span className="absolute inset-0 grid place-items-center">
      <span
        aria-hidden="true"
        className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
      />
      <span className="sr-only">Loading</span>
    </span>
  );

  const content = block ? (
    <>
      {/* Liquid layer, inside the box: the pill gives up its right end and the disc fills it */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 filter-[url(#blob-button-goo)]">
        <span
          className={cn(
            "absolute inset-y-0 right-0 left-0 rounded-full transition-[right]",
            spring,
            "group-hover:right-14 group-focus-visible:right-14",
            t.fill,
          )}
        />
        {/* Tucked inside the pill's round end at rest */}
        <span
          className={cn(
            "absolute top-0 right-0 size-12 scale-75 rounded-full transition-transform group-hover:scale-100 group-focus-visible:scale-100",
            spring,
            t.fill,
          )}
        />
      </span>

      {/* Label stays centred on the pill as it draws in */}
      <span
        className={cn(
          "relative flex flex-1 items-center justify-center gap-2 px-7 text-center transition-[padding]",
          spring,
          "group-hover:pr-21 group-focus-visible:pr-21",
          loading && "invisible",
        )}
      >
        {children}
      </span>
      {spinner}

      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-0 right-0 flex size-12 scale-50 items-center justify-center opacity-0 transition duration-500 ease-out-expo",
          "group-hover:scale-100 group-hover:opacity-100 group-hover:delay-150 group-focus-visible:scale-100 group-focus-visible:opacity-100",
        )}
      >
        {disc}
      </span>
    </>
  ) : (
    <>
      {/* Liquid layer: pill + disc share the goo filter. It's wider than the button (gap + disc) so the filter doesn't clip */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[calc(100%+3.5rem)] filter-[url(#blob-button-goo)]"
      >
        <span className={cn("absolute inset-y-0 left-0 w-[calc(100%-3.5rem)] rounded-full", t.fill)} />
        {/* Tucked inside the pill's round end at rest */}
        <span
          className={cn(
            "absolute top-0 right-0 size-12 -translate-x-14 rounded-full transition-transform",
            spring,
            revealed,
            t.fill,
          )}
        />
      </span>

      <span className={cn("relative flex items-center gap-2 px-7", loading && "invisible")}>{children}</span>
      {spinner}

      {/* Icon rides in after the disc; only catches the pointer once visible, so the hover can cross the gap */}
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute top-1/2 left-[calc(100%+0.5rem)] flex size-12 -translate-x-5 -translate-y-1/2 scale-50 items-center justify-center opacity-0 transition duration-500 ease-out-expo",
          "group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100 group-hover:delay-150",
          "group-focus-visible:scale-100 group-focus-visible:opacity-100",
          revealed,
        )}
      >
        {disc}
      </span>
    </>
  );

  const classes = cn(
    "group relative h-12 items-center text-cta",
    block ? "flex w-full" : "inline-flex",
    t.text,
    inert,
    className,
  );

  if (rest.href !== undefined) {
    const { "aria-disabled": ariaDisabled, ...link } = rest as React.ComponentProps<typeof Link>;
    return (
      <Link
        className={classes}
        aria-disabled={loading || ariaDisabled || undefined}
        aria-busy={loading || undefined}
        {...link}
      >
        {content}
      </Link>
    );
  }

  const { type = "button", disabled, ...button } = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type={type} className={classes} disabled={disabled || loading} aria-busy={loading || undefined} {...button}>
      {content}
    </button>
  );
}
