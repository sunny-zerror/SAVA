import { cn } from "@/utils/cn";

type Tone = "light" | "dark";

interface FrameProps {
  /** "dark" for sections on the brand gradient */
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

/**
 * SAVA's framed layout: section content sits between two hairline rails at the page gutters, which
 * draw down from the top as the frame scrolls into view (data-frame-rails, src/lib/global.ts).
 */
export function Frame({ tone = "light", className, children }: FrameProps) {
  const dark = tone === "dark";

  return (
    <div className="container">
      {/* The border keeps its room, but transparent: the rails drawn over it are what's seen */}
      <div className={cn("relative border-x border-transparent", className)}>
        {/* Absolutely placed, so it never takes a cell when the frame itself is a grid; z-20 keeps it
            over cards that run to the rails (under the fixed 3D canvases, header and drawers). Each
            rail draws down from the top as the frame scrolls into view (src/lib/global.ts). */}
        <span aria-hidden="true" data-frame-rails className="pointer-events-none absolute -inset-x-px inset-y-0 z-20">
          {["left-0", "right-0"].map((side) => (
            <span
              key={side}
              data-frame-rail
              className={cn("absolute inset-y-0 w-px", side, dark ? "bg-paper/39" : "bg-rule")}
            />
          ))}
        </span>
        {children}
      </div>
    </div>
  );
}

/**
 * A rule across the frame, with a dot where it meets each rail. The dots are always there; the line
 * draws in between them as it scrolls into view, from both ends to meet in the middle
 * (data-frame-rule, src/lib/global.ts).
 */
export function FrameRule({ tone = "light", className }: { tone?: Tone; className?: string }) {
  const dark = tone === "dark";
  // z-30: over the frame's rails (z-20), which run through the dots' centres
  const dot = cn("absolute top-1/2 z-30 size-1.75 -translate-y-1/2 rounded-full", dark ? "bg-paper" : "bg-mist");

  return (
    <div aria-hidden="true" data-frame-rule className={cn("relative h-px", className)}>
      {/* Two halves, so the line can draw in from both dots at once and meet in the middle */}
      {["left-0", "right-0"].map((half) => (
        <span
          key={half}
          data-frame-line
          className={cn("absolute inset-y-0 w-1/2", half, dark ? "bg-paper/39" : "bg-rule")}
        />
      ))}
      {["-left-1", "-right-1"].map((side) => (
        <span key={side} data-frame-dot className={cn(dot, side)} />
      ))}
    </div>
  );
}
