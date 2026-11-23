import Link from "next/link";
import type { BlogPost } from "@/data/blog-posts";
import { cn } from "@/utils/cn";
import { blogHref } from "@/utils/url";

const pill = "inline-flex h-10 items-center rounded-full px-6 text-cta transition-colors duration-300";

/** The foot of an article: the posts either side, each a pill over its title */
export default function BlogPager({ previous, next }: { previous: BlogPost; next: BlogPost }) {
  return (
    <nav aria-label="More posts" className="grid grid-cols-2 gap-6 border-t border-line pt-8">
      <Link href={blogHref(previous.slug)} rel="prev" className="group flex flex-col items-start gap-4">
        <span className={cn(pill, "bg-surface text-ink group-hover:bg-mist")}>Previous</span>
        <span className="max-w-xs text-h6 transition-colors group-hover:text-accent">{previous.title}</span>
      </Link>
      <Link href={blogHref(next.slug)} rel="next" className="group flex flex-col items-end gap-4 text-right">
        <span className={cn(pill, "bg-accent text-paper group-hover:bg-navy")}>Next</span>
        <span className="max-w-xs text-h6 transition-colors group-hover:text-accent">{next.title}</span>
      </Link>
    </nav>
  );
}
