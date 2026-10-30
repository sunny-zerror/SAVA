import Sparkle from "@/components/ui/Sparkle";
import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: string;
  /** h1 by default; h2 when something above already holds the page's h1 (e.g. a hero) */
  as?: "h1" | "h2";
  eyebrow?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * The h1 block at the top of a page — one per page, for SEO. Same "✦ KICKER over bold heading"
 * look as SectionHeading; on framed pages sit it between two FrameRules with px-inset py-10.
 */
export default function PageHeader({
  title,
  as: Heading = "h1",
  eyebrow,
  description,
  align = "left",
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-4", align === "center" && "items-center text-center", className)}>
      {eyebrow && (
        <p className="flex items-center gap-2 text-kicker text-accent">
          <Sparkle />
          {eyebrow}
        </p>
      )}
      <Heading data-heading-effect className="max-w-4xl">
        {title}
      </Heading>
      {description && <p className="max-w-2xl text-body-lg text-muted">{description}</p>}
    </header>
  );
}
