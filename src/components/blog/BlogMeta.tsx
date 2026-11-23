import type { BlogPost } from "@/data/blog-posts";
import { cn } from "@/utils/cn";
import { formatDate } from "@/utils/format";

interface BlogMetaProps {
  post: BlogPost;
  /** "glass" — frosted chips over a photo */
  tone?: "plain" | "glass";
  className?: string;
}

/** A post's author and date, as two small pills */
export default function BlogMeta({ post, tone = "plain", className }: BlogMetaProps) {
  const chip = cn(
    "rounded-full px-3 py-1 text-caption",
    tone === "glass" ? "bg-paper/70 text-ink backdrop-blur-sm" : "bg-surface text-muted",
  );
  return (
    <p className={cn("flex flex-wrap gap-2", className)}>
      <span className={chip}>{post.author}</span>
      <time dateTime={post.date} className={chip}>
        {formatDate(post.date)}
      </time>
    </p>
  );
}
