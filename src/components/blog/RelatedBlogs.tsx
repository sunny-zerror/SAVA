import BlogCard from "@/components/blog/BlogCard";
import ProductCarousel from "@/components/product/ProductCarousel";
import { Frame, FrameRule } from "@/components/ui/Frame";
import type { BlogPost } from "@/data/blog-posts";

/** The article's foot: more posts, from its category first, as blog cards in a carousel */
export default function RelatedBlogs({ posts }: { posts: BlogPost[] }) {
  return (
    // data-reveal-replay: its entrances play on the way down and reverse on the way back up
    <section aria-labelledby="related-blogs" data-reveal-replay>
      <Frame className="pt-section pb-section">
        <FrameRule />
        <ProductCarousel
          label="Related posts"
          noun="posts"
          itemClassName="basis-[85%] sm:basis-1/2 lg:basis-1/3"
          title={
            <h2 id="related-blogs" data-heading-effect className="max-w-sm">
              Featured Related Blogs
            </h2>
          }
        >
          {posts.map((post) => (
            <BlogCard key={post.slug} post={post} sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 48vw, 85vw" />
          ))}
        </ProductCarousel>
      </Frame>
    </section>
  );
}
