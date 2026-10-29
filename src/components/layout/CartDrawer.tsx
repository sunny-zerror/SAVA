"use client";

import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Skeleton from "@/components/ui/Skeleton";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/utils/format";
import { mediaUrl } from "@/utils/media";
import { productHref } from "@/utils/url";

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const { cart, lines, count, loading, busy, increment, decrement, removeItem } = useCart();

  const footer = lines.length ? (
    <div className="flex flex-col gap-4">
      {Boolean(cart?.totalDiscount) && (
        <div className="flex justify-between text-caption text-sale">
          <span>Discount</span>
          <span>−{formatPrice(cart?.totalDiscount)}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>Subtotal</span>
        <span>{formatPrice(cart?.discountedPrice || cart?.totalprice)}</span>
      </div>
      <p className="text-caption text-muted">Shipping and taxes are calculated at checkout.</p>
      <ButtonLink href="/checkout" onClick={close} fullWidth size="lg">
        Checkout
      </ButtonLink>
    </div>
  ) : null;

  return (
    <Drawer open={isOpen} onClose={close} title={`Your bag (${count})`} footer={footer}>
      {loading ? (
        <div className="flex flex-col gap-6 p-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-28 w-22" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-6 text-center">
          <p className="font-primary text-2xl">Your bag is empty</p>
          <ButtonLink href="/shop" onClick={close} variant="outline">
            Continue shopping
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line px-6">
          {lines.map((line) => {
            const href = line.product?.slug ? productHref(line.product.slug) : "/shop";
            const key = `${line.productId}-${line.variantDetail?.variantDetailId ?? ""}`;
            return (
              <li key={key} className="flex gap-4 py-6">
                <Link href={href} onClick={close} className="relative h-28 w-22 shrink-0 bg-surface">
                  <Image
                    src={mediaUrl(line.asset?.path)}
                    alt={line.asset?.altText || line.name}
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex justify-between gap-4">
                    <Link href={href} onClick={close} className="hover:underline">
                      {line.name}
                    </Link>
                    <span>{formatPrice(line.finalPrice)}</span>
                  </div>
                  {Boolean(line.variantDetail?.selectedOptions?.length) && (
                    <p className="text-caption text-muted">{line.variantDetail?.selectedOptions.join(" / ")}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <QuantityStepper
                      value={line.qty}
                      disabled={busy}
                      max={
                        line.variantDetail?.trackInventory ? (line.variantDetail.stockQuantity ?? undefined) : undefined
                      }
                      onIncrement={() => increment(line)}
                      onDecrement={() => decrement(line)}
                    />
                    <button
                      onClick={() => removeItem(line)}
                      disabled={busy}
                      className="text-caption text-muted underline hover:text-ink"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
