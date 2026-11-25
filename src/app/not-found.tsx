import type { Metadata } from "next";
import Image from "next/image";
import BlobButton from "@/components/ui/BlobButton";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Page not found", noIndex: true });

export default function NotFound() {
  return (
    // The hero's gradient and oversized type, with the stick standing in the middle of the "404"
    <section aria-labelledby="not-found" className="relative isolate overflow-hidden bg-gradient-light text-paper">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-20" />
      <Frame tone="dark" className="py-section">
        <FrameRule tone="dark" />
        <div className="flex flex-col items-center gap-6 px-inset py-12 text-center md:py-16">
          {/* Big type, so it fades in rather than rising */}
          <div data-reveal="fade" aria-hidden="true" className="relative grid place-items-center">
            <p className="text-gradient-sky text-display">404</p>
            <Image
              src="/images/home/hero-stick.png"
              alt=""
              width={1122}
              height={1402}
              sizes="12rem"
              className="absolute w-24 rotate-12 drop-shadow-2xl md:w-44"
            />
          </div>
          <p className="flex items-center gap-2 text-kicker">
            <Sparkle />
            Error 404
          </p>
          <h1 data-heading-effect id="not-found" className="max-w-3xl">
            Page not found
          </h1>
          <p data-reveal className="max-w-md text-body-lg text-paper/80">
            The page you&apos;re looking for has moved or no longer exists.
          </p>
          {/* gap-x-16 leaves room for the first button's hover disc */}
          <div data-reveal className="mt-2 flex flex-wrap items-center justify-center gap-x-16 gap-y-4">
            <BlobButton href="/" tone="light">
              Back home
            </BlobButton>
            <BlobButton href="/shop" tone="soft">
              Shop all
            </BlobButton>
          </div>
        </div>
        <FrameRule tone="dark" />
      </Frame>
    </section>
  );
}
