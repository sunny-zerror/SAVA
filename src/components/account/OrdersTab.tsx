"use client";

import { useQuery } from "@apollo/client/react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
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

  if (loading && !data) return <Skeleton className="h-48 w-full" />;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-body text-muted">You haven&apos;t placed any orders yet.</p>
        <ButtonLink href="/shop">Start shopping</ButtonLink>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {orders.map((order) => (
        <li key={order._id}>
          <details className="group border border-line">
            <summary className="grid cursor-pointer list-none grid-cols-2 gap-4 p-5 text-caption md:grid-cols-5 [&::-webkit-details-marker]:hidden">
              <span>
                <span className="block text-muted">Order</span>
                {order.orderNo}
              </span>
              <span>
                <span className="block text-muted">Placed</span>
                {formatDate(order.createdAt)}
              </span>
              <span>
                <span className="block text-muted">Status</span>
                {humanize(order.shipmentStatus || order.fulfillmentStatus || order.paymentStatus)}
              </span>
              <span>
                <span className="block text-muted">Total</span>
                {formatPrice(order.orderPrice ?? order.totalprice)}
              </span>
              <span className="self-center text-right underline group-open:hidden">View</span>
              <span className="hidden self-center text-right underline group-open:inline">Hide</span>
            </summary>
            <div className="flex flex-col gap-4 border-t border-line p-5">
              {order.cart.map((line) => (
                <div
                  key={`${line.productId}-${line.variantDetail?.variantDetailId ?? ""}`}
                  className="flex gap-4 text-caption"
                >
                  <div className="relative h-20 w-16 shrink-0 bg-surface">
                    <Image
                      src={mediaUrl(line.asset?.path)}
                      alt={line.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 justify-between gap-4">
                    <div>
                      <p>{line.name}</p>
                      <p className="text-muted">
                        {line.variantDetail?.selectedOptions?.join(" / ")} · Qty {line.qty}
                      </p>
                    </div>
                    <span>{formatPrice(line.finalPrice)}</span>
                  </div>
                </div>
              ))}
              {order.invoiceUrl && (
                <a
                  href={order.invoiceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-start text-caption underline"
                >
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
