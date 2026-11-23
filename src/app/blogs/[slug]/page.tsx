import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogArticle from "@/components/blog/BlogArticle";
import BlogPager from "@/components/blog/BlogPager";
import BlogSidebar from "@/components/blog/BlogSidebar";
import RelatedBlogs from "@/components/blog/RelatedBlogs";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Frame, FrameRule } from "@/components/ui/Frame";
import { BLOG_NAME } from "@/data/blog-posts";
import { articleSchema } from "@/lib/schema";
import { createMetadata } from "@/lib/seo";
import {
  getAdjacentPosts,
  getAllBlogPosts,
  getBlogCategories,
  getBlogCategory,
  getBlogPost,
  getRecentPosts,
  getRelatedPosts,
} from "@/services/blog";
import { blogHref } from "@/utils/url";

type Params = Promise<{ slug: string }>;

// Every post is built as a static page; any other slug gets its 404 from the router
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllBlogPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();
  return createMetadata({
    title: post.title,
    description: post.excerpt,
    path: blogHref(post.slug),
    image: post.image.src,
    imageAlt: post.image.alt,
    type: "article",
  });
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const category = getBlogCategory(post.category);
  const { previous, next } = getAdjacentPosts(post);

  return (
    <>
      {/* data-reveal-sequence: the opening plays in page order, a step apart */}
      <section aria-label={post.title} data-reveal-sequence>
        <JsonLd data={articleSchema(post, category?.name ?? BLOG_NAME)} />
        <Frame>
          <div data-reveal className="px-inset pt-8 pb-6">
            <Breadcrumbs
              items={[
                { name: BLOG_NAME, path: "/blogs" },
                { name: post.title, path: blogHref(post.slug) },
              ]}
            />
          </div>
          <FrameRule />
          <div className="grid lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-stack px-inset py-10 lg:border-r lg:border-line lg:py-14">
              <BlogArticle post={post} />
              <BlogPager previous={previous} next={next} />
            </div>
            <div className="px-inset py-10 max-lg:border-t max-lg:border-line lg:py-14">
              {/* The column runs the article's full height (for its rule); the sidebar rides down it */}
              <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]">
                <BlogSidebar categories={getBlogCategories()} active={post.category} recent={getRecentPosts(post)} />
              </div>
            </div>
          </div>
        </Frame>
      </section>

      <RelatedBlogs posts={getRelatedPosts(post)} />
    </>
  );
}
