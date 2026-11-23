import { RiArrowLeftLine, RiArrowRightLine } from "@remixicon/react";
import Link from "next/link";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** builds the URL for a page, e.g. (p) => `/shop?page=${p}` */
  href: (page: number) => string;
  /** "boxes" — a square per page; "arrows" — round arrows either side of 01 02 03 */
  variant?: "boxes" | "arrows";
}

/** A round arrow: SAVA blue while it leads somewhere, a plain outline at either end */
function Arrow({ to, direction }: { to: string | null; direction: "previous" | "next" }) {
  const Icon = direction === "previous" ? RiArrowLeftLine : RiArrowRightLine;
  const label = direction === "previous" ? "Previous page" : "Next page";
  const shape = "center size-9 rounded-full border transition-colors duration-300";
  if (!to) {
    return (
      <span aria-hidden="true" className={cn(shape, "border-line text-muted")}>
        <Icon className="size-4" />
      </span>
    );
  }
  return (
    <Link
      href={to}
      aria-label={label}
      rel={direction === "previous" ? "prev" : "next"}
      className={cn(shape, "border-accent bg-accent text-paper hover:border-navy hover:bg-navy")}
    >
      <Icon className="size-4" />
    </Link>
  );
}

export default function Pagination({ page, totalPages, href, variant = "boxes" }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (variant === "arrows") {
    return (
      <nav aria-label="Pagination" className="flex items-center justify-center gap-6">
        <Arrow to={page > 1 ? href(page - 1) : null} direction="previous" />
        <ul className="flex items-center gap-3">
          {pages.map((p) => (
            <li key={p}>
              <Link
                href={href(p)}
                aria-label={`Page ${p}`}
                aria-current={p === page ? "page" : undefined}
                className={cn(
                  "text-body-lg tabular-nums transition-colors hover:text-accent",
                  p === page ? "text-ink" : "text-muted/70",
                )}
              >
                {String(p).padStart(2, "0")}
              </Link>
            </li>
          ))}
        </ul>
        <Arrow to={page < totalPages ? href(page + 1) : null} direction="next" />
      </nav>
    );
  }

  return (
    <nav aria-label="Pagination" className="mt-stack flex items-center justify-center gap-2">
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "center size-10 border text-caption font-medium tabular-nums transition-colors",
            p === page ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
          )}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
