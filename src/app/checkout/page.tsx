import type { Metadata } from "next";
import CheckoutView from "@/components/checkout/CheckoutView";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "Checkout", path: "/checkout", noIndex: true });

export default function CheckoutPage() {
  return (
    <section className="section container flex flex-col gap-stack">
      <h1 className="text-4xl md:text-5xl">Checkout</h1>
      <CheckoutView />
    </section>
  );
}
