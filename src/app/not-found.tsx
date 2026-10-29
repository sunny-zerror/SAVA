import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Page not found", noIndex: true });

export default function NotFound() {
  return (
    <section className="section container flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-eyebrow text-muted">404</p>
      <h1>Page not found</h1>
      <p className="max-w-md text-body text-muted">The page you&apos;re looking for has moved or no longer exists.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/shop" variant="outline">
          Shop all
        </ButtonLink>
      </div>
    </section>
  );
}
