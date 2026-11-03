import Sparkle from "@/components/ui/Sparkle";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  /** Pair with aria-labelledby on the section */
  id?: string;
  /** "dark" for white type on the brand gradient */
  tone?: "light" | "dark";
  className?: string;
}

/** Section label + heading: "✦ OUR BESTSELLERS" over an h2, centred (pass lg:items-start lg:text-left in className to left-align it on large screens) */
export default function SectionHeading({ eyebrow, title, id, tone = "light", className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col items-center gap-4 text-center", className)}>
      <p className={cn("flex items-center gap-2 text-kicker", tone === "dark" ? "text-paper" : "text-accent")}>
        <Sparkle />
        {eyebrow}
      </p>
      <h2 data-heading-effect id={id} className={cn("max-w-3xl", tone === "dark" ? "text-paper" : "text-ink")}>
        {title}
      </h2>
    </div>
  );
}
