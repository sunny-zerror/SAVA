import Image from "next/image";
import Link from "next/link";
import BlogMeta from "@/components/blog/BlogMeta";
import type { BlogPost } from "@/data/blog-posts";
import { blogHref } from "@/utils/url";

interface BlogCardProps {
  post: BlogPost;
  /** true for the first row on a page — loads the image eagerly for LCP */
  priority?: boolean;
  sizes?: string;
}

/**
 * A post in the Sweat School grid and the related carousel: the cover photo (leaning in on hover),
 * the title, then the author and date. The whole card opens the post.
 */
export default function BlogCard({
  post,
  priority,
  sizes = "(min-width: 64rem) 30vw, (min-width: 40rem) 48vw, 100vw",
}: BlogCardProps) {
  return (
    <article className="group/card relative flex flex-col gap-5 bg-paper p-5 md:p-6">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-surface">
        <Image
          src={post.image.src}
          alt={post.image.alt}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectPosition: post.image.position }}
          className="object-cover transition-transform duration-700 ease-out-expo group-hover/card:scale-105"
        />
      </div>
      <h3 className="text-h5">
        {/* Stretched link: the card opens the post */}
        <Link
          href={blogHref(post.slug)}
          className="transition-colors group-hover/card:text-accent after:absolute after:inset-0"
        >
          {post.title}
        </Link>
      </h3>
      <BlogMeta post={post} className="mt-auto" />
    </article>
  );
}
