import { RiSearchLine } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import BlogMeta from "@/components/blog/BlogMeta";
import { fieldClass } from "@/components/ui/field-class";
import type { BlogCategory, BlogPost } from "@/data/blog-posts";
import { cn } from "@/utils/cn";
import { blogHref } from "@/utils/url";

interface BlogSidebarProps {
  categories: BlogCategory[];
  /** The post's category, shown as the current one */
  active: string;
  recent: BlogPost[];
}

/**
 * The article's sidebar: search (a plain GET form to /blogs?q=, so it works without JS), the
 * categories as links into the listing, and the latest posts with their author and date over the photo.
 */
export default function BlogSidebar({ categories, active, recent }: BlogSidebarProps) {
  return (
    <aside aria-label="Sweat School" data-reveal="stagger" className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <h2 className="text-h5">Search</h2>
        <form action="/blogs" role="search" className="flex items-center gap-2">
          <label htmlFor="blog-search" className="sr-only">
            Search the blog
          </label>
          <input
            id="blog-search"
            type="search"
            name="q"
            placeholder="Text here.."
            className={cn(fieldClass, "min-w-0 flex-1 rounded-full border-line bg-paper")}
          />
          <button
            type="submit"
            aria-label="Search"
            className="center size-12 shrink-0 rounded-full bg-accent text-paper transition-colors duration-300 hover:bg-navy"
          >
            <RiSearchLine aria-hidden="true" className="size-5" />
          </button>
        </form>
      </div>

      <nav aria-labelledby="blog-categories" className="flex flex-col gap-4">
        <h2 id="blog-categories" className="text-h5">
          Category
        </h2>
        <ul className="flex flex-col gap-1 text-caption">
          {categories.map((c) => {
            const current = c.slug === active;
            return (
              <li key={c.slug}>
                <Link
                  href={`/blogs?category=${c.slug}`}
                  aria-current={current ? "true" : undefined}
                  className={cn(
                    "block rounded-full px-4 py-2 transition-colors duration-300",
                    current ? "bg-surface text-accent" : "text-ink hover:bg-surface hover:text-accent",
                  )}
                >
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {recent.length > 0 && (
        <div className="flex flex-col gap-4">
          <h2 className="text-h5">Recent Blog</h2>
          <ul className="flex flex-col">
            {recent.map((post) => (
              <li key={post.slug} className="border-b border-line py-5 first:pt-0 last:border-b-0">
                <article className="group/card relative flex flex-col gap-4">
                  <div className="relative aspect-8/5 overflow-hidden rounded-2xl bg-surface">
                    <Image
                      src={post.image.src}
                      alt={post.image.alt}
                      fill
                      sizes="(min-width: 64rem) 22vw, 100vw"
                      style={{ objectPosition: post.image.position }}
                      className="object-cover transition-transform duration-700 ease-out-expo group-hover/card:scale-105"
                    />
                    <BlogMeta post={post} tone="glass" className="absolute top-3 left-3" />
                  </div>
                  <h3 className="text-h6">
                    <Link
                      href={blogHref(post.slug)}
                      className="transition-colors group-hover/card:text-accent after:absolute after:inset-0"
                    >
                      {post.title}
                    </Link>
                  </h3>
                </article>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
