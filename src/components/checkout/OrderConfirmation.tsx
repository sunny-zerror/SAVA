"use client";

import { useQuery } from "@apollo/client/react";
import { RiCheckLine, RiMailSendLine, RiTruckLine, RiUser3Line } from "@remixicon/react";
import OrderSummary from "@/components/checkout/OrderSummary";
import BlobButton from "@/components/ui/BlobButton";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Skeleton from "@/components/ui/Skeleton";
import Sparkle from "@/components/ui/Sparkle";
import { GET_ORDER_PAYMENT } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import { ordersStore } from "@/lib/local-shop";
import type { Address } from "@/types";

const nextSteps = [
  { Icon: RiMailSendLine, title: "Confirmation on its way", body: "We've emailed your receipt and order details." },
  { Icon: RiTruckLine, title: "Packed with care", body: "We'll let you know as soon as it ships." },
  { Icon: RiUser3Line, title: "Track it anytime", body: "Follow the delivery from the Orders tab in your account." },
];

function AddressBlock({ title, address }: { title: string; address?: Address | null }) {
  if (!address) return null;
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-line p-6 text-caption md:p-8">
      <h2 className="flex items-center gap-2 text-kicker text-accent">
        <Sparkle />
        {title}
      </h2>
      <p className="text-muted">
        <span className="font-medium text-ink">
          {address.firstname} {address.lastname}
        </span>
        <br />
        {[address.flat, address.addressline1, address.addressline2].filter(Boolean).join(", ")}
        <br />
        {address.city}, {address.states} {address.pincode}
        <br />
        {address.country} · {address.countryCode} {address.phone}
      </p>
    </div>
  );
}

/** Thank-you page body. z-commerce redirects here with ?orderId= after a successful payment. */
export default function OrderConfirmation({ orderId }: { orderId?: string }) {
  const { data, loading: fetching } = useQuery(GET_ORDER_PAYMENT, {
    variables: { id: orderId ?? "" },
    skip: !orderId || !isApiConfigured,
  });
  // Without z-commerce: the test order placed in this browser (src/lib/local-shop.ts)
  const localOrders = ordersStore.useValue();
  const order = isApiConfigured
    ? data?.getClientSidePaymentByOrderId?.order
    : localOrders.find((placed) => placed._id === orderId);
  const loading = isApiConfigured && fetching;

  return (
    <>
      {/* Celebration band on the brand gradient */}
      <section
        aria-labelledby="order-confirmed"
        className="relative isolate overflow-hidden bg-gradient-light text-paper"
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-20" />
        <Frame tone="dark" className="py-section">
          <FrameRule tone="dark" />
          <div className="flex flex-col items-center gap-6 px-inset py-14 text-center md:py-20">
            <span aria-hidden="true" className="center size-16 rounded-full bg-mint text-navy">
              <RiCheckLine className="size-8" />
            </span>
            <p className="flex items-center gap-2 text-kicker text-mint">
              <Sparkle />
              {isApiConfigured ? "Payment successful" : "Test order placed"}
            </p>
            <h1 data-heading-effect id="order-confirmed" className="max-w-3xl">
              Thank you for your order
            </h1>
            <p data-reveal className="max-w-xl text-body-lg text-paper/80">
              {!isApiConfigured
                ? `${order ? `Order ${order.orderNo}` : "Your order"} is saved in this browser — no payment was taken.`
                : order
                  ? `Order ${order.orderNo} is confirmed — we've emailed your receipt.`
                  : "Your order is confirmed — we've emailed your receipt and details."}
            </p>
            {/* gap-x-16 leaves room for the first button's hover disc */}
            <div data-reveal className="mt-2 flex flex-wrap items-center justify-center gap-x-16 gap-y-4">
              <BlobButton href="/shop" tone="light">
                Continue shopping
              </BlobButton>
              <BlobButton href="/account?tab=orders" tone="soft">
                View orders
              </BlobButton>
            </div>
          </div>
          <FrameRule tone="dark" />
        </Frame>
      </section>

      <Frame className="py-section">
        {(loading || order) && (
          // Revealed once the order is in (the attribute arrives with it), so the rise is the
          // addresses and summary, not the skeletons
          <div
            data-reveal={loading ? undefined : "stagger"}
            className="grid items-start gap-stack px-inset pb-section lg:grid-cols-[1fr_28rem]"
          >
            {loading ? (
              <>
                <Skeleton className="h-56 rounded-3xl" />
                <Skeleton className="h-96 rounded-3xl" />
              </>
            ) : (
              order && (
                <>
                  <div className="grid gap-grid md:grid-cols-2">
                    <AddressBlock title="Delivering to" address={order.shippingAddress} />
                    <AddressBlock title="Billing" address={order.billingAddress} />
                  </div>
                  <OrderSummary
                    lines={order.cart}
                    subtotal={order.totalprice}
                    discount={order.totalDiscount}
                    shipping={order.shippingAmount ?? 0}
                    tax={order.taxAmount}
                    total={order.orderPrice ?? order.discountedPrice ?? order.totalprice}
                  />
                </>
              )
            )}
          </div>
        )}

        <FrameRule />
        <h2 className="flex items-center justify-center gap-2 px-inset py-10 text-kicker text-accent">
          <Sparkle />
          What happens next
        </h2>
        <FrameRule />
        <ol data-reveal="stagger" className="grid gap-grid px-inset pt-10 md:grid-cols-3">
          {nextSteps.map(({ Icon, title, body }, i) => (
            <li key={title} className="flex flex-col gap-4 rounded-3xl bg-surface p-6 md:p-8">
              <span className="flex items-center justify-between">
                <span aria-hidden="true" className="center size-12 rounded-full bg-gradient-badge text-paper">
                  <Icon className="size-5" />
                </span>
                <span aria-hidden="true" className="text-caption font-medium text-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="text-h4">{title}</span>
                <span className="text-caption text-muted">{body}</span>
              </span>
            </li>
          ))}
        </ol>
      </Frame>
    </>
  );
}
