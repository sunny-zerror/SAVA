import { RiErrorWarningLine } from "@remixicon/react";
import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
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
        <div data-reveal className="mt-2 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/checkout" size="lg">
            Try again
          </ButtonLink>
          <ButtonLink href="/contact" variant="outline" size="lg">
            Contact us
          </ButtonLink>
        </div>
      </div>
      <FrameRule />
    </Frame>
  );
}
