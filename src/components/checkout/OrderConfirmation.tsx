"use client";

import { useQuery } from "@apollo/client/react";
import OrderSummary from "@/components/checkout/OrderSummary";
import { ButtonLink } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { GET_ORDER_PAYMENT } from "@/graphql";
import { isApiConfigured } from "@/lib/env";
import type { Address } from "@/types";

function AddressBlock({ title, address }: { title: string; address?: Address | null }) {
  if (!address) return null;
  return (
    <div className="flex flex-col gap-2 text-caption">
      <h3 className="font-secondary text-eyebrow text-muted">{title}</h3>
      <p>
        {address.firstname} {address.lastname}
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
  const { data, loading } = useQuery(GET_ORDER_PAYMENT, {
    variables: { id: orderId ?? "" },
    skip: !orderId || !isApiConfigured,
  });
  const order = data?.getClientSidePaymentByOrderId?.order;

  return (
    <div className="grid items-start gap-stack lg:grid-cols-[1fr_28rem]">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-eyebrow text-success">Payment successful</p>
          <h1>Thank you for your order</h1>
          {order && (
            <p className="text-body-lg text-muted">Order {order.orderNo} — we&apos;ve emailed your confirmation.</p>
          )}
        </header>
        {order && (
          <div className="grid gap-6 md:grid-cols-2">
            <AddressBlock title="Delivering to" address={order.shippingAddress} />
            <AddressBlock title="Billing" address={order.billingAddress} />
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/shop">Continue shopping</ButtonLink>
          <ButtonLink href="/account?tab=orders" variant="outline">
            View orders
          </ButtonLink>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96" />
      ) : (
        order && (
          <OrderSummary
            lines={order.cart}
            subtotal={order.totalprice}
            discount={order.totalDiscount}
            shipping={order.shippingAmount ?? 0}
            tax={order.taxAmount}
            total={order.orderPrice ?? order.discountedPrice ?? order.totalprice}
          />
        )
      )}
    </div>
  );
}
