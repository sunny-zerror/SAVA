/*
 * Sweat School reads for Server Components. The posts are local (src/data/blog-posts.ts) — z-commerce
 * doesn't carry articles — but pages still go through here, so moving them to a CMS later changes
 * this file and nothing else.
 */
import { blogCategories, blogPosts, type BlogCategory, type BlogPost } from "@/data/blog-posts";

export const BLOG_PAGE_SIZE = 9;

export interface BlogPage {
  posts: BlogPost[];
  totalCount: number;
}

export const getBlogCategories = (): BlogCategory[] => blogCategories;

export const getBlogCategory = (slug?: string) => blogCategories.find((c) => c.slug === slug);

/** One page of posts, newest first — filtered to a category, or searched across titles and copy */
export function getBlogPosts({ category, search, page = 1 }: { category?: string; search?: string; page?: number }) {
  const term = search?.trim().toLowerCase();
  const matches = blogPosts.filter((post) => {
    if (category && post.category !== category) return false;
    if (!term) return true;
    return [post.title, post.excerpt, ...post.sections.map((s) => `${s.heading} ${s.body}`)]
      .join(" ")
      .toLowerCase()
      .includes(term);
  });
  const offset = (page - 1) * BLOG_PAGE_SIZE;
  return { posts: matches.slice(offset, offset + BLOG_PAGE_SIZE), totalCount: matches.length } satisfies BlogPage;
}

export const getAllBlogPosts = () => blogPosts;

export const getBlogPost = (slug: string) => blogPosts.find((p) => p.slug === slug);

/** The newest posts other than the one being read — the article sidebar's Recent Blog */
export const getRecentPosts = (post: BlogPost, limit = 2) => blogPosts.filter((p) => p !== post).slice(0, limit);

/** Others from the post's category first, then the rest, newest first — for the related carousel */
export function getRelatedPosts(post: BlogPost, limit = 6) {
  const others = blogPosts.filter((p) => p !== post);
  const same = others.filter((p) => p.category === post.category);
  return [...same, ...others.filter((p) => p.category !== post.category)].slice(0, limit);
}

/** The posts either side in the journal's order, wrapping round at the ends */
export function getAdjacentPosts(post: BlogPost) {
  const i = blogPosts.indexOf(post);
  const n = blogPosts.length;
  return { previous: blogPosts[(i - 1 + n) % n], next: blogPosts[(i + 1) % n] };
}
