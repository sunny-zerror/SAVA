"use client";

import { useQuery } from "@apollo/client/react";
import { RiArrowDownSLine, RiBox3Line, RiDownload2Line } from "@remixicon/react";
import Image from "next/image";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import { GET_ORDERS } from "@/graphql";
import { formatDate, formatPrice, humanize } from "@/utils/format";
import { mediaUrl } from "@/utils/media";

export default function OrdersTab({ userId }: { userId: string }) {
  const { data, loading } = useQuery(GET_ORDERS, {
    variables: { filter: { userId }, limit: 50, offset: 0 },
    fetchPolicy: "cache-and-network",
  });
  const orders = data?.getOrdersByFilters.data ?? [];

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-3xl" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-3xl bg-surface px-6 py-14 text-center">
        <span aria-hidden="true" className="center size-14 rounded-full bg-paper text-accent">
          <RiBox3Line className="size-6" />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-h3">No orders yet</h2>
          <p className="text-body text-muted">When you place an order, you can track it here.</p>
        </div>
        <ButtonLink href="/shop">Start shopping</ButtonLink>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order._id}>
          <details className="group overflow-hidden rounded-3xl border border-line transition-colors open:border-accent/40">
            <summary className="grid cursor-pointer list-none grid-cols-2 items-center gap-4 p-5 text-caption tabular-nums md:grid-cols-[repeat(4,1fr)_auto] md:p-6 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-muted">Order</span>
                <span className="font-medium">{order.orderNo}</span>
              </span>
              <span>
                <span className="block text-muted">Placed</span>
                {formatDate(order.createdAt)}
              </span>
              <span>
                <span className="block text-muted">Status</span>
                <span className="mt-1 inline-flex rounded-full bg-mist/60 px-3 py-0.5 text-eyebrow text-navy">
                  {humanize(order.shipmentStatus || order.fulfillmentStatus || order.paymentStatus)}
                </span>
              </span>
              <span>
                <span className="block text-muted">Total</span>
                <span className="font-medium">{formatPrice(order.orderPrice ?? order.totalprice)}</span>
              </span>
              <span className="col-span-2 flex items-center justify-end gap-2 text-cta md:col-span-1">
                <span className="group-open:hidden">View</span>
                <span className="hidden group-open:inline">Hide</span>
                <span
                  aria-hidden="true"
                  className="center size-9 rounded-full bg-surface transition-transform duration-300 group-open:rotate-180"
                >
                  <RiArrowDownSLine className="size-5" />
                </span>
              </span>
            </summary>
            <div className="flex flex-col gap-4 border-t border-line bg-surface/50 p-5 md:p-6">
              {order.cart.map((line) => (
                <div
                  key={`${line.productId}-${line.variantDetail?.variantDetailId ?? ""}`}
                  className="flex gap-4 text-caption"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-surface">
                    <Image
                      src={mediaUrl(line.asset?.path)}
                      alt={line.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  {/* items-baseline: the name (h6) and price (body) have different leading */}
                  <div className="flex flex-1 items-baseline justify-between gap-4">
                    <div>
                      <p className="text-h6">{line.name}</p>
                      <p className="text-muted tabular-nums">
                        {line.variantDetail?.selectedOptions?.join(" / ")} · Qty {line.qty}
                      </p>
                    </div>
                    <span className="text-body font-medium tabular-nums">{formatPrice(line.finalPrice)}</span>
                  </div>
                </div>
              ))}
              {order.invoiceUrl && (
                <a
                  href={order.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass({ variant: "outline", className: "self-start" })}
                >
                  <RiDownload2Line aria-hidden="true" className="size-4" />
                  Download invoice
                </a>
              )}
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
