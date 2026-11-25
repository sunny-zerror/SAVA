import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";
import { Frame } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return (
    <Frame className="pb-section">
      <div className="px-inset py-10 md:py-14">
        {/* The heading leads the left column, above the steps */}
        <CheckoutView heading={<PageHeader eyebrow="Secure checkout" title="Checkout" />} />
      </div>
    </Frame>
  );
}
