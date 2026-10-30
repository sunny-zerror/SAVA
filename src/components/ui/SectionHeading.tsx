import Sparkle from "@/components/ui/Sparkle";
import { cn } from "@/utils/cn";

interface SectionHeadingProps {
  eyebrow: string;
  title: React.ReactNode;
  /** Pair with aria-labelledby on the section */
  id?: string;
  align?: "center" | "start";
  /** "dark" for white type on the brand gradient */
  tone?: "light" | "dark";
  className?: string;
}

/** Section label + heading: "✦ OUR BESTSELLERS" over a bold h2 */
export default function SectionHeading({
  eyebrow,
  title,
  id,
  align = "center",
  tone = "light",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn("flex flex-col gap-4", align === "center" ? "items-center text-center" : "items-start", className)}
    >
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
