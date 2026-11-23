import Image from "next/image";
import type { BlogPost } from "@/data/blog-posts";

/** A post's body: the cover photo, the title (the page's h1), the opening paragraph, then its sections */
export default function BlogArticle({ post }: { post: BlogPost }) {
  return (
    <article className="flex flex-col gap-10">
      <div data-reveal="image" className="relative aspect-16/9 overflow-hidden rounded-2xl bg-surface">
        <Image
          src={post.image.src}
          alt={post.image.alt}
          fill
          priority
          sizes="(min-width: 95rem) 58rem, (min-width: 64rem) 62vw, 100vw"
          style={{ objectPosition: post.image.position }}
          className="object-cover"
        />
      </div>

      <header className="flex flex-col gap-6">
        {/* Sized down a role: it shares the row with the sidebar */}
        <h1 data-heading-effect className="text-h2">
          {post.title}
        </h1>
        <p data-reveal className="text-body text-muted">
          {post.excerpt}
        </p>
      </header>

      <div className="flex flex-col gap-8">
        {post.sections.map((section) => (
          <section key={section.heading} data-reveal className="flex flex-col gap-3">
            <h2 className="text-h4">{section.heading}</h2>
            <p className="text-body text-muted">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
