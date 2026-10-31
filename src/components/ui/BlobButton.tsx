import { RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";
import { cn } from "@/utils/cn";

type Tone = "accent" | "light";

const tones: Record<Tone, { fill: string; text: string }> = {
  accent: { fill: "bg-accent", text: "text-paper" },
  light: { fill: "bg-paper", text: "text-ink" },
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

type BlobButtonProps = React.ComponentProps<typeof Link> & {
  tone?: Tone;
  /** Shown in the disc on hover; defaults to an arrow */
  icon?: React.ReactNode;
  /**
   * Fill the container's width. At rest the pill spans it all; on hover the pill draws in from the
   * right and the disc melts out into the space it leaves, all inside the button's own box.
   */
  block?: boolean;
};

/**
 * SAVA's signature CTA. At rest it's a plain pill; on hover a disc stretches out of its
 * right end like liquid, snaps free a small gap away and the icon pops in.
 * The disc overflows the link's box, so the pill keeps its size and centring.
 */
export default function BlobButton({ tone = "accent", icon, block, className, children, ...props }: BlobButtonProps) {
  const t = tones[tone];
  const revealed = "group-hover:translate-x-0 group-focus-visible:translate-x-0";
  const spring = "duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]";

  if (block) {
    const hovered = "group-hover:right-14 group-focus-visible:right-14";
    return (
      <Link className={cn("group relative flex h-12 w-full items-center text-cta", t.text, className)} {...props}>
        {/* Liquid layer, inside the box: the pill gives up its right end and the disc fills it */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 filter-[url(#blob-button-goo)]">
          <span
            className={cn("absolute inset-y-0 right-0 left-0 rounded-full transition-[right]", spring, hovered, t.fill)}
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
            "relative flex-1 px-7 text-center transition-[padding]",
            spring,
            "group-hover:pr-21 group-focus-visible:pr-21",
          )}
        >
          {children}
        </span>

        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-0 right-0 flex size-12 scale-50 items-center justify-center opacity-0 transition duration-500 ease-out-expo",
            "group-hover:scale-100 group-hover:opacity-100 group-hover:delay-150 group-focus-visible:scale-100 group-focus-visible:opacity-100",
          )}
        >
          {icon ?? <RiArrowRightLine className="size-4" />}
        </span>
      </Link>
    );
  }

  return (
    <Link className={cn("group relative inline-flex h-12 items-center text-cta", t.text, className)} {...props}>
      {/* Liquid layer: pill + disc share the goo filter. It's wider than the link (gap + disc) so the filter doesn't clip */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-[calc(100%+3.5rem)] filter-[url(#blob-button-goo)]"
      >
        <span className={cn("absolute inset-y-0 left-0 w-[calc(100%-3.5rem)] rounded-full", t.fill)} />
        {/* Tucked inside the pill's round end at rest */}
        <span
          className={cn(
            "absolute top-0 right-0 size-12 -translate-x-14 rounded-full transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
            revealed,
            t.fill,
          )}
        />
      </span>

      <span className="relative px-7">{children}</span>

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
        {icon ?? <RiArrowRightLine className="size-4" />}
      </span>
    </Link>
  );
}
