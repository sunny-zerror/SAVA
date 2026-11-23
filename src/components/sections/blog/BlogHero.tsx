import Image from "next/image";
import BlobButton from "@/components/ui/BlobButton";
import { Frame } from "@/components/ui/Frame";
import type { BlogPost } from "@/data/blog-posts";
import { blogHref } from "@/utils/url";

interface BlogHeroProps {
  /** The page's h1 — for screen readers and search; the featured post does the talking on screen */
  title: string;
  /** The post the banner features: its title and a Know More link, at the left */
  featured?: BlogPost;
}

/**
 * Sweat School's hero: a full-width 22:9 banner like the shop's (ShopHero), with a photo in place of
 * the film and the featured post's title and link centred down its left side, over a fade from the
 * left that keeps the white type legible.
 */
export default function BlogHero({ title, featured }: BlogHeroProps) {
  return (
    // data-reveal-sequence: the title reveals itself, then the button rises in
    <section
      aria-labelledby="blog-hero"
      data-reveal-sequence
      className="relative aspect-22/9 min-h-72 overflow-hidden bg-surface text-paper"
    >
      <Image
        src="/images/blogs/blogs_hero_banner.png"
        alt="SAVA antiperspirant sticks standing on dark rocks under a stormy sky"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-full bg-linear-to-r from-navy/60 via-navy/20 to-transparent md:w-2/3"
      />

      {/* Grid: the frame's container stretches to the banner's height, rails running top to bottom */}
      <div className="relative grid h-full">
        <Frame tone="dark" className="flex h-full flex-col items-start justify-center gap-6 px-inset md:gap-8">
          <h1 id="blog-hero" className="sr-only">
            {title}
          </h1>
          {featured && (
            <>
              <h2 data-heading-effect className="max-w-xl">
                {featured.title}
              </h2>
              <div data-reveal>
                <BlobButton href={blogHref(featured.slug)} tone="light">
                  Know More
                </BlobButton>
              </div>
            </>
          )}
        </Frame>
      </div>
    </section>
  );
}
