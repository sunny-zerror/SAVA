"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { CartLine } from "@/types";
import { formatPrice } from "@/utils/format";
import { mediaUrl } from "@/utils/media";

interface OrderSummaryProps {
  lines: CartLine[];
  subtotal: number;
  discount?: number | null;
  shipping?: number | null;
  tax?: number | null;
  total: number;
  /** checkout only — shows the coupon field */
  coupon?: {
    code?: string | null;
    onApply: (code: string) => Promise<boolean>;
    onRemove: () => void;
  };
  title?: string;
}

/** Line items + totals. Used beside the checkout form and on the order confirmation page. */
export default function OrderSummary({
  lines,
  subtotal,
  discount,
  shipping,
  tax,
  total,
  coupon,
  title = "Order summary",
}: OrderSummaryProps) {
  const [code, setCode] = useState("");
  const [applying, setApplying] = useState(false);

  return (
    <section aria-labelledby="order-summary" className="flex flex-col gap-6 rounded-3xl bg-surface p-5 md:p-8">
      <h2 id="order-summary" className="text-h3">
        {title}
      </h2>

      <ul className="flex flex-col gap-5">
        {lines.map((line) => (
          <li key={`${line.productId}-${line.variantDetail?.variantDetailId ?? ""}`} className="flex gap-4">
            <div className="relative h-20 w-16 shrink-0 rounded-xl bg-paper">
              <Image
                src={mediaUrl(line.asset?.path)}
                alt={line.asset?.altText || line.name}
                fill
                sizes="64px"
                className="rounded-xl object-cover"
              />
              <span className="absolute -top-2 -right-2 center size-5 rounded-full bg-accent text-micro font-medium text-paper tabular-nums">
                {line.qty}
              </span>
            </div>
            {/* items-baseline: the name (h6) and price (body) have different leading */}
            <div className="flex flex-1 items-baseline justify-between gap-4 text-caption">
              <div>
                <p className="text-h6">{line.name}</p>
                {Boolean(line.variantDetail?.selectedOptions?.length) && (
                  <p className="text-muted">{line.variantDetail?.selectedOptions.join(" / ")}</p>
                )}
              </div>
              <span className="text-body font-medium tabular-nums">{formatPrice(line.finalPrice)}</span>
            </div>
          </li>
        ))}
      </ul>

      {coupon && (
        <div className="border-t border-line pt-6">
          {coupon.code ? (
            <div className="flex items-center justify-between text-caption">
              <span>
                Coupon <strong className="font-medium">{coupon.code}</strong> applied
              </span>
              <button
                type="button"
                onClick={coupon.onRemove}
                className="text-cta text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <label htmlFor="coupon" className="sr-only">
                Coupon code
              </label>
              <input
                id="coupon"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Coupon code"
                className="h-11 min-w-0 flex-1 rounded-full border border-line bg-paper px-5 text-input uppercase transition-[border-color,box-shadow] outline-none placeholder:normal-case focus:border-accent focus:ring-4 focus:ring-accent/15"
              />
              <Button
                type="button"
                variant="ink"
                loading={applying}
                disabled={!code}
                onClick={async () => {
                  setApplying(true);
                  if (await coupon.onApply(code)) setCode("");
                  setApplying(false);
                }}
              >
                Apply
              </Button>
            </div>
          )}
        </div>
      )}

      <dl className="flex flex-col gap-3 border-t border-line pt-6 text-caption tabular-nums">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {Boolean(discount) && (
          <div className="flex justify-between text-sale">
            <dt>Discount</dt>
            <dd>−{formatPrice(discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt>Shipping</dt>
          <dd>{shipping == null ? "Calculated next" : shipping === 0 ? "Free" : formatPrice(shipping)}</dd>
        </div>
        {Boolean(tax) && (
          <div className="flex justify-between">
            <dt>Tax</dt>
            <dd>{formatPrice(tax)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t border-line pt-4 text-h5">
          <dt>Total</dt>
          <dd>{formatPrice(total)}</dd>
        </div>
      </dl>
    </section>
  );
}
