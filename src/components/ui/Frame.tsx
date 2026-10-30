import { cn } from "@/utils/cn";

type Tone = "light" | "dark";

interface FrameProps {
  /** "dark" for sections on the brand gradient */
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}

/** SAVA's framed layout: section content sits between two hairline rails at the page gutters */
export function Frame({ tone = "light", className, children }: FrameProps) {
  return (
    <div className="container">
      <div className={cn("relative border-x", tone === "dark" ? "border-paper/20" : "border-line", className)}>
        {children}
      </div>
    </div>
  );
}

/** A rule across the frame, with a dot where it meets each rail */
export function FrameRule({ tone = "light", className }: { tone?: Tone; className?: string }) {
  const dot = cn("absolute top-1/2 size-1.75 -translate-y-1/2 rounded-full", tone === "dark" ? "bg-paper" : "bg-mist");

  return (
    <div aria-hidden="true" className={cn("relative h-px", tone === "dark" ? "bg-paper/20" : "bg-line", className)}>
      <span className={cn(dot, "-left-1")} />
      <span className={cn(dot, "-right-1")} />
    </div>
  );
}
