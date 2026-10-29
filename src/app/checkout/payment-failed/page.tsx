import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Payment failed",
  path: "/checkout/payment-failed",
  noIndex: true,
});

// z-commerce redirects here when Nimbbl reports a failed or cancelled payment
export default function PaymentFailedPage() {
  return (
    <section className="section container flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
      <p className="text-eyebrow text-sale">Payment not completed</p>
      <h1>Your payment didn&apos;t go through</h1>
      <p className="max-w-md text-body text-muted">
        You haven&apos;t been charged and your bag is saved. Please try again or use another payment method.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <ButtonLink href="/checkout">Try again</ButtonLink>
        <ButtonLink href="/contact" variant="outline">
          Contact us
        </ButtonLink>
      </div>
    </section>
  );
}
