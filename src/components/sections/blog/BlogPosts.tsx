import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Pagination from "@/components/ui/Pagination";
import type { BlogCategory, BlogPost } from "@/data/blog-posts";
import { cn } from "@/utils/cn";

interface BlogPostsProps {
  categories: BlogCategory[];
  posts: BlogPost[];
  /** Slug of the active category ("" for all) */
  activeCategory: string;
  /** The search term, "" when not searching */
  search: string;
  page: number;
  totalPages: number;
  href: (page: number) => string;
}

/**
 * The Sweat School listing, framed between the page rails: the category pills, a rule, the posts in a
 * ruled grid (one hairline between cells) and the pagination underneath.
 */
export default function BlogPosts({
  categories,
  posts,
  activeCategory,
  search,
  page,
  totalPages,
  href,
}: BlogPostsProps) {
  const pills = [{ slug: "", name: "All" }, ...categories];

  return (
    // The section's bottom space sits inside the frame, so the rails run on down to the footer
    <Frame className="pb-section">
      {/* One row that scrolls sideways on phones; scroll={false} keeps the reader at the grid */}
      <nav aria-label="Categories" className="px-inset pt-section pb-8">
        <ul data-reveal="stagger" className="-mx-inset no-scrollbar flex gap-3 overflow-x-auto px-inset">
          {pills.map((c) => {
            // While searching, no category is the current one
            const current = !search && activeCategory === c.slug;
            return (
              <li key={c.slug || "all"} className="shrink-0">
                <Link
                  href={c.slug ? `/blogs?category=${c.slug}` : "/blogs"}
                  scroll={false}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "inline-flex h-12 items-center rounded-full px-5 text-cta transition-colors duration-300",
                    current ? "bg-accent text-paper" : "bg-surface text-ink hover:bg-mist",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
        {search && (
          <p className="mt-6 text-body text-muted">
            Showing posts about “{search}” ·{" "}
            <Link href="/blogs" className="link-underline text-ink">
              Clear search
            </Link>
          </p>
        )}
      </nav>
      <FrameRule />

      {posts.length === 0 ? (
        <p className="px-inset py-section text-center text-body text-muted">
          {search ? `Nothing matches “${search}” — try another word.` : "No posts here yet."}
        </p>
      ) : (
        // Hairlines between the cells: each card draws its right and bottom edge, and the list runs a
        // pixel past the box on those sides so the outer ones are clipped — the rails and the rule
        // underneath stand in for them. Unlike a gap-px grid, a short last row leaves no grey cells.
        <div className="overflow-hidden border-b border-line">
          <ul data-reveal="stagger" className="-mr-px -mb-px grid sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, i) => (
              <li key={post.slug} className="grid border-r border-b border-line">
                <BlogCard post={post} priority={i < 3} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 && (
        <div className="px-inset py-10">
          <Pagination page={page} totalPages={totalPages} href={href} variant="arrows" />
        </div>
      )}
    </Frame>
  );
}
