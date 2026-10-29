import Link from "next/link";
import { cn } from "@/utils/cn";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** builds the URL for a page, e.g. (p) => `/shop?page=${p}` */
  href: (page: number) => string;
}

export default function Pagination({ page, totalPages, href }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <nav aria-label="Pagination" className="mt-stack flex items-center justify-center gap-2">
      {pages.map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            "center size-10 border text-caption transition-colors",
            p === page ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
          )}
        >
          {p}
        </Link>
      ))}
    </nav>
  );
}
