import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";
import { Frame, FrameRule } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return (
    <Frame className="py-section">
      <FrameRule />
      <PageHeader eyebrow="Secure checkout" title="Checkout" align="center" className="px-inset py-10" />
      <FrameRule />
      <div className="px-inset py-10 md:py-14">
        <CheckoutView />
      </div>
    </Frame>
  );
}
