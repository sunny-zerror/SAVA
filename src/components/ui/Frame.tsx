import { Fragment } from "react";
import { cn } from "@/utils/cn";

type Tone = "light" | "dark";

interface FrameProps {
  /** "dark" for sections on the brand gradient */
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

/**
 * SAVA's framed layout: section content sits between two hairline rails at the page gutters.
 * While the frame is in view, a pulse of light now and then runs down both rails, lighting up each
 * FrameRule it passes (data-frame-rails, src/lib/global.ts).
 */
export function Frame({ tone = "light", className, children }: FrameProps) {
  const dark = tone === "dark";
  // Hidden until animated, so reduced motion / no JS keeps the plain rails
  const comet = cn(
    "absolute top-0 h-36 w-px bg-linear-to-b from-transparent opacity-0",
    dark ? "to-paper" : "to-accent",
  );
  const head = cn(
    "absolute bottom-0 left-1/2 size-0.75 -translate-x-1/2 translate-y-1/2 rounded-full",
    dark ? "bg-paper shadow-[0_0_6px_1px_var(--color-paper)]" : "bg-accent shadow-[0_0_6px_1px_var(--color-accent)]",
  );

  return (
    <div className="container">
      <div className={cn("relative border-x", dark ? "border-paper/20" : "border-line", className)}>
        {/* Absolutely placed, so it never takes a cell when the frame itself is a grid; z-20 keeps it
            over cards that run to the rails (under the fixed 3D canvases, header and drawers).
            Clipped top and bottom only, so the pulse's glow can spill sideways off the rail. */}
        <span
          aria-hidden="true"
          data-frame-rails
          className="pointer-events-none absolute -inset-x-px inset-y-0 z-20 overflow-y-clip"
        >
          {["left-0", "right-0"].map((side) => (
            <span key={side} data-frame-comet className={cn(comet, side)}>
              <span className={head} />
            </span>
          ))}
        </span>
        {children}
      </div>
    </div>
  );
}

/**
 * A rule across the frame, with a dot where it meets each rail. It draws out from its centre as it
 * scrolls into view, the dots popping in at the rails; when a pulse comes down the rails, the dots
 * flare and a spark runs in from each side to meet in the middle (data-frame-rule, src/lib/global.ts).
 */
export function FrameRule({ tone = "light", className }: { tone?: Tone; className?: string }) {
  const dark = tone === "dark";
  const dot = cn("absolute top-1/2 size-1.75 -translate-y-1/2 rounded-full", dark ? "bg-paper" : "bg-mist");
  // A sibling of the dot, not inside it: when the dot flares, a nested ring would be scaled twice
  const ring = cn(
    "absolute top-1/2 size-1.75 -translate-y-1/2 rounded-full border opacity-0",
    dark ? "border-paper" : "border-accent",
  );
  const spark = cn("absolute inset-y-0 left-0 w-24 from-transparent opacity-0", dark ? "to-paper" : "to-accent");

  return (
    <div aria-hidden="true" data-frame-rule className={cn("relative h-px", className)}>
      <span data-frame-line className={cn("absolute inset-0", dark ? "bg-paper/20" : "bg-line")} />
      <span className="absolute inset-0 overflow-hidden">
        {/* Brightest at the leading edge: the first runs in from the left, the second from the right */}
        <span data-frame-spark className={cn(spark, "bg-linear-to-r")} />
        <span data-frame-spark className={cn(spark, "bg-linear-to-l")} />
      </span>
      {["-left-1", "-right-1"].map((side) => (
        // Ring first, so it spreads out from under the dot
        <Fragment key={side}>
          <span data-frame-ring className={cn(ring, side)} />
          <span data-frame-dot className={cn(dot, side)} />
        </Fragment>
      ))}
    </div>
  );
}
