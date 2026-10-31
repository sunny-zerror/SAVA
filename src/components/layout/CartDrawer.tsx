"use client";

import { RiLockLine } from "@remixicon/react";
import Image from "next/image";
import BlobButton from "@/components/ui/BlobButton";
import Drawer from "@/components/ui/Drawer";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Skeleton from "@/components/ui/Skeleton";
import { useCart } from "@/hooks/useCart";
import { useDrawerMotion } from "@/hooks/useDrawerMotion";
import { useCartStore } from "@/store/cart-store";
import { formatPrice } from "@/utils/format";
import { mediaUrl } from "@/utils/media";

/** A block that rises into its own overflow-hidden mask as the drawer opens (useDrawerMotion) */
function Line({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden">
      <div data-drawer-line className={className}>
        {children}
      </div>
    </div>
  );
}

/**
 * The bag: each item on its own row between hairlines, the subtotal and Checkout at the foot. It
 * moves like the menu (useDrawerMotion) — rows rise in once the panel is open, and sink back before
 * it leaves.
 */
export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const { cart, lines, count, loading, busy, increment, decrement, removeItem } = useCart();
  const { scope, shown, requestClose } = useDrawerMotion({ open: isOpen, onClose: close });

  const footer = lines.length ? (
    <div data-drawer-extra className="flex flex-col gap-4">
      <dl className="flex flex-col gap-1">
        {Boolean(cart?.totalDiscount) && (
          <div className="flex justify-between text-caption text-sale">
            <dt>Discount</dt>
            <dd className="tabular-nums">−{formatPrice(cart?.totalDiscount)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between text-h5">
          <dt>Subtotal</dt>
          <dd className="tabular-nums">{formatPrice(cart?.discountedPrice || cart?.totalprice)}</dd>
        </div>
      </dl>
      <p className="-mt-3 text-caption text-muted">Shipping and taxes calculated at checkout.</p>
      <BlobButton href="/checkout" onClick={requestClose} block icon={<RiLockLine className="size-4" />}>
        Checkout
      </BlobButton>
    </div>
  ) : null;

  return (
    <Drawer
      name="cart-drawer"
      open={shown}
      onClose={requestClose}
      title={`Your bag (${count})`}
      heading={
        <h2 className="flex items-baseline gap-2 text-h5">
          Your bag
          <span className="text-caption text-muted tabular-nums">({count})</span>
        </h2>
      }
      footer={footer}
    >
      <div ref={scope} className="flex min-h-full flex-col px-6 md:px-8">
        {loading ? (
          [0, 1].map((i) => (
            <div key={i} className="flex gap-4 border-b border-line py-6">
              <Skeleton className="size-20 rounded-2xl" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-1/3 rounded-full" />
              </div>
            </div>
          ))
        ) : lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-section text-center">
            <Line className="flex flex-col items-center gap-2">
              <p className="text-h4">Your bag is empty</p>
              <p className="text-body text-muted">Add a stick and it&apos;ll wait for you here.</p>
            </Line>
            <Line className="w-56">
              <BlobButton href="/shop" onClick={requestClose} block>
                Shop all
              </BlobButton>
            </Line>
          </div>
        ) : (
          <ul className="flex flex-col">
            {lines.map((line) => {
              const key = `${line.productId}-${line.variantDetail?.variantDetailId ?? ""}`;
              const options = line.variantDetail?.selectedOptions ?? [];
              return (
                <li key={key} className="relative">
                  <span aria-hidden="true" data-drawer-rule className="absolute inset-x-0 bottom-0 h-px bg-line" />
                  <Line className="flex gap-4 py-6">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface">
                      <Image
                        src={mediaUrl(line.asset?.path)}
                        alt={line.asset?.altText || line.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                      {/* items-baseline: the name (h6) and price (body) have different leading */}
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-h6">{line.name}</p>
                          {options.length > 0 && <p className="text-caption text-muted">{options.join(" / ")}</p>}
                        </div>
                        <span className="shrink-0 text-body font-medium tabular-nums">
                          {formatPrice(line.finalPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <QuantityStepper
                          value={line.qty}
                          disabled={busy}
                          max={
                            line.variantDetail?.trackInventory
                              ? (line.variantDetail.stockQuantity ?? undefined)
                              : undefined
                          }
                          onIncrement={() => increment(line)}
                          onDecrement={() => decrement(line)}
                        />
                        <button
                          onClick={() => removeItem(line)}
                          disabled={busy}
                          aria-label={`Remove ${line.name}`}
                          className="link-underline text-caption text-muted transition-colors hover:text-ink disabled:opacity-40"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </Line>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
