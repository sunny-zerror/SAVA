import { cn } from "@/utils/cn";

interface PageHeaderProps {
  title: string;
  eyebrow?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/** The h1 block at the top of a page — one per page, for SEO */
export default function PageHeader({ title, eyebrow, description, align = "left", className }: PageHeaderProps) {
  return (
    <header className={cn("flex flex-col gap-3", align === "center" && "items-center text-center", className)}>
      {eyebrow && <p className="text-eyebrow text-muted">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="max-w-2xl text-body-lg text-muted">{description}</p>}
    </header>
  );
}
