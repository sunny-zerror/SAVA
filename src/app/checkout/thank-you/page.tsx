import type { Metadata } from "next";
import OrderConfirmation from "@/components/checkout/OrderConfirmation";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Order confirmed",
  path: "/checkout/thank-you",
  noIndex: true,
});

// z-commerce redirects here after a successful Nimbbl payment: /checkout/thank-you?orderId=…
export default async function ThankYouPage({ searchParams }: { searchParams: Promise<{ orderId?: string }> }) {
  const { orderId } = await searchParams;
  return <OrderConfirmation orderId={orderId} />;
}
