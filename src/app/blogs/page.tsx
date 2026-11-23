import type { Metadata } from "next";
import BlogHero from "@/components/sections/blog/BlogHero";
import BlogPosts from "@/components/sections/blog/BlogPosts";
import JsonLd from "@/components/seo/JsonLd";
import { BLOG_NAME, FEATURED_BLOG_SLUG } from "@/data/blog-posts";
import { blogListSchema } from "@/lib/schema";
import { createMetadata, createPageMetadata } from "@/lib/seo";
import { BLOG_PAGE_SIZE, getBlogCategories, getBlogCategory, getBlogPost, getBlogPosts } from "@/services/blog";

type SearchParams = Promise<{ category?: string; page?: string; q?: string }>;

const pageNumber = (value?: string) => Math.max(1, Number.parseInt(value ?? "1", 10) || 1);

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category, q } = await searchParams;
  // Results pages stay out of the index: endless near-copies of the listing
  if (q?.trim()) return createMetadata({ title: `Search: ${q.trim()}`, path: "/blogs", noIndex: true });
  const active = getBlogCategory(category);
  if (!active) return createPageMetadata("/blogs");
  return createMetadata({
    title: `${active.name} — ${BLOG_NAME}`,
    description: `${BLOG_NAME} on ${active.name.toLowerCase()}: guides and notes from the SAVA team.`,
    path: `/blogs?category=${active.slug}`,
  });
}

export default async function BlogsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category: categoryParam, page: pageParam, q } = await searchParams;
  const page = pageNumber(pageParam);
  // A search runs across every post, so it sets any category aside
  const search = q?.trim() ?? "";
  const active = search ? undefined : getBlogCategory(categoryParam);

  const { posts, totalCount } = getBlogPosts({ category: active?.slug, search, page });
  const totalPages = Math.ceil(totalCount / BLOG_PAGE_SIZE);
  const title = search ? `${BLOG_NAME}: results for “${search}”` : active ? `${BLOG_NAME}: ${active.name}` : BLOG_NAME;

  const query = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (active) params.set("category", active.slug);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/blogs?${qs}` : "/blogs";
  };

  return (
    <>
      {/* The banner holds the page's h1 (for screen readers) on every view, and features a post on screen */}
      <BlogHero title={title} featured={getBlogPost(FEATURED_BLOG_SLUG)} />
      <section aria-label={title}>
        <JsonLd data={blogListSchema(posts, title, query(page))} />
        <BlogPosts
          categories={getBlogCategories()}
          posts={posts}
          activeCategory={active?.slug ?? ""}
          search={search}
          page={page}
          totalPages={totalPages}
          href={query}
        />
      </section>
    </>
  );
}
