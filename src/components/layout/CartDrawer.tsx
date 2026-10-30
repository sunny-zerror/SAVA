"use client";

import { RiDeleteBin6Line, RiShoppingBag3Line } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Skeleton from "@/components/ui/Skeleton";
import Sparkle from "@/components/ui/Sparkle";
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
      <dl className="flex flex-col gap-2">
        {Boolean(cart?.totalDiscount) && (
          <div className="flex justify-between text-caption text-sale">
            <dt>Discount</dt>
            <dd>−{formatPrice(cart?.totalDiscount)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between">
          <dt className="font-bold">Subtotal</dt>
          <dd className="text-xl font-bold">{formatPrice(cart?.discountedPrice || cart?.totalprice)}</dd>
        </div>
      </dl>
      <p className="text-caption text-muted">Shipping and taxes are calculated at checkout.</p>
      <ButtonLink href="/checkout" onClick={close} fullWidth size="lg">
        Checkout
      </ButtonLink>
    </div>
  ) : null;

  return (
    <Drawer
      open={isOpen}
      onClose={close}
      title={`Your bag (${count})`}
      heading={
        <h2 className="flex items-center gap-3 text-lg">
          Your bag
          <span className="center h-6 min-w-6 rounded-full bg-accent px-2 text-xs text-paper">{count}</span>
        </h2>
      }
      footer={footer}
    >
      {loading ? (
        <div className="flex flex-col gap-6 p-6 md:px-8">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-28 w-22 rounded-2xl" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-1/3 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-5 p-6 text-center">
          <span aria-hidden="true" className="center size-16 rounded-full bg-surface text-accent">
            <RiShoppingBag3Line className="size-7" />
          </span>
          <div className="flex flex-col gap-2">
            <p className="font-primary text-2xl font-bold">Your bag is empty</p>
            <p className="text-caption text-muted">Find your scent and it&apos;ll wait for you here.</p>
          </div>
          <ButtonLink href="/shop" onClick={close}>
            Continue shopping
          </ButtonLink>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-line px-6 md:px-8">
          {lines.map((line) => {
            const href = line.product?.slug ? productHref(line.product.slug) : "/shop";
            const key = `${line.productId}-${line.variantDetail?.variantDetailId ?? ""}`;
            return (
              <li key={key} className="flex gap-4 py-6">
                <Link
                  href={href}
                  onClick={close}
                  className="relative h-28 w-22 shrink-0 overflow-hidden rounded-2xl bg-surface"
                >
                  <Image
                    src={mediaUrl(line.asset?.path)}
                    alt={line.asset?.altText || line.name}
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <div className="flex justify-between gap-4">
                    <Link href={href} onClick={close} className="font-bold transition-colors hover:text-accent">
                      {line.name}
                    </Link>
                    <span className="shrink-0 font-bold">{formatPrice(line.finalPrice)}</span>
                  </div>
                  {Boolean(line.variantDetail?.selectedOptions?.length) && (
                    <p className="flex items-center gap-1.5 text-caption text-muted">
                      <Sparkle className="size-2.5 text-accent" />
                      {line.variantDetail?.selectedOptions.join(" / ")}
                    </p>
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
                      aria-label={`Remove ${line.name}`}
                      className="center size-9 rounded-full text-muted transition-colors hover:bg-surface hover:text-sale disabled:opacity-40"
                    >
                      <RiDeleteBin6Line aria-hidden="true" className="size-4" />
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
