"use client";

import { RiRefreshLine } from "@remixicon/react";
import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Frame className="py-section">
      <FrameRule />
      <div className="flex flex-col items-center gap-6 px-inset py-14 text-center md:py-20">
        <p className="flex items-center gap-2 text-kicker text-accent">
          <Sparkle />
          Unexpected error
        </p>
        <h1 data-heading-effect className="max-w-3xl">
          Something went wrong
        </h1>
        <p className="max-w-xl text-body-lg text-muted">
          Please try again. If it keeps happening, contact us and we&apos;ll sort it out.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button onClick={reset} size="lg">
            <RiRefreshLine aria-hidden="true" className="size-4" />
            Try again
          </Button>
          <ButtonLink href="/" variant="outline" size="lg">
            Back home
          </ButtonLink>
        </div>
      </div>
      <FrameRule />
    </Frame>
  );
}
