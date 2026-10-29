"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="section container flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <h1>Something went wrong</h1>
      <p className="max-w-md text-body text-muted">
        Please try again. If it keeps happening, contact us and we&apos;ll sort it out.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="outline">
          Back home
        </ButtonLink>
      </div>
    </section>
  );
}
