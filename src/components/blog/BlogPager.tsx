import { RiArrowLeftLine } from "@remixicon/react";
import Link from "next/link";
import BlobButton from "@/components/ui/BlobButton";
import type { BlogPost } from "@/data/blog-posts";
import { blogHref } from "@/utils/url";

/**
 * The foot of an article: the posts either side, each a button over its title. The buttons are
 * `block` at a set width, so the hover disc stays inside them at the page's edges. The title is a
 * second way in for the pointer only: the button, named after the post, is the one in the tab order.
 */
export default function BlogPager({ previous, next }: { previous: BlogPost; next: BlogPost }) {
  return (
    <nav aria-label="More posts" className="grid grid-cols-2 gap-6 border-t border-line pt-8">
      <div className="flex flex-col items-start gap-4">
        <div className="w-full max-w-48">
          <BlobButton
            href={blogHref(previous.slug)}
            rel="prev"
            aria-label={`Previous post: ${previous.title}`}
            tone="soft"
            block
            icon={<RiArrowLeftLine className="size-4" />}
          >
            Previous
          </BlobButton>
        </div>
        <Link
          href={blogHref(previous.slug)}
          tabIndex={-1}
          aria-hidden="true"
          className="max-w-xs text-h6 transition-colors hover:text-accent"
        >
          {previous.title}
        </Link>
      </div>
      <div className="flex flex-col items-end gap-4 text-right">
        <div className="w-full max-w-48">
          <BlobButton href={blogHref(next.slug)} rel="next" aria-label={`Next post: ${next.title}`} block>
            Next
          </BlobButton>
        </div>
        <Link
          href={blogHref(next.slug)}
          tabIndex={-1}
          aria-hidden="true"
          className="max-w-xs text-h6 transition-colors hover:text-accent"
        >
          {next.title}
        </Link>
      </div>
    </nav>
  );
}
