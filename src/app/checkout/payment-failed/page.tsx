import { RiErrorWarningLine } from "@remixicon/react";
import type { Metadata } from "next";
import BlobButton from "@/components/ui/BlobButton";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Payment failed",
  path: "/checkout/payment-failed",
  noIndex: true,
});

// z-commerce redirects here when Nimbbl reports a failed or cancelled payment
export default function PaymentFailedPage() {
  return (
    <Frame className="py-section">
      <FrameRule />
      <div className="flex flex-col items-center gap-6 px-inset py-14 text-center md:py-20">
        <span aria-hidden="true" className="center size-16 rounded-full bg-sale/10 text-sale">
          <RiErrorWarningLine className="size-8" />
        </span>
        <p className="flex items-center gap-2 text-kicker text-sale">
          <Sparkle />
          Payment not completed
        </p>
        <h1 data-heading-effect className="max-w-3xl">
          Your payment didn&apos;t go through
        </h1>
        <p data-reveal className="max-w-xl text-body-lg text-muted">
          You haven&apos;t been charged and your bag is saved. Please try again or use another payment method.
        </p>
        {/* gap-x-16 leaves room for the first button's hover disc */}
        <div data-reveal className="mt-2 flex flex-wrap justify-center gap-x-16 gap-y-4">
          <BlobButton href="/checkout">Try again</BlobButton>
          <BlobButton href="/contact" tone="soft">
            Contact us
          </BlobButton>
        </div>
      </div>
      <FrameRule />
    </Frame>
  );
}
