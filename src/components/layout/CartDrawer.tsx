"use client";

import { RiDeleteBin6Line, RiLockLine } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import RangeStrip from "@/components/product/RangeStrip";
import BlobButton from "@/components/ui/BlobButton";
import Drawer, { drawerRise } from "@/components/ui/Drawer";
import { FrameRule } from "@/components/ui/Frame";
import QuantityStepper from "@/components/ui/QuantityStepper";
import Skeleton from "@/components/ui/Skeleton";
import Sparkle from "@/components/ui/Sparkle";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";
import { mediaUrl } from "@/utils/media";
import { productHref } from "@/utils/url";

/** What every stick promises (from the FAQ), shown while the bag is empty */
const promises = [
  "Up to 48 hours of freshness",
  "Dermatologist approved & hypoallergenic",
  "Free from parabens & dyes",
];

/** The drawer's content between hairline rails, like the page Frame (and the menu) */
function Rails({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col px-6 md:px-8">
      <div className="flex flex-1 flex-col border-x border-line">{children}</div>
    </div>
  );
}

/**
 * The empty bag: an invitation, the three sticks, what they promise, and a way to the shop — each
 * rising in after the one before as the drawer opens, like the menu
 */
function EmptyBag({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rise = (i: number) => drawerRise(open, i);
  return (
    <Rails>
      <div style={rise(0).style} className={cn("flex flex-col items-start gap-3 px-inset py-8", rise(0).className)}>
        <p className="flex items-center gap-2 text-kicker text-accent">
          <Sparkle />
          Nothing here yet
        </p>
        <p className="text-h3">Find your signature scent</p>
        <p className="max-w-xs text-body text-muted">Add a stick and it&apos;ll wait for you here.</p>
      </div>

      <FrameRule />
      <section
        aria-labelledby="bag-range"
        style={rise(1).style}
        className={cn("flex flex-col gap-4 px-inset py-8", rise(1).className)}
      >
        <h3 id="bag-range" className="flex items-center gap-2 text-kicker text-accent">
          <Sparkle />
          Shop the range
        </h3>
        <RangeStrip onSelect={onClose} tileClassName="aspect-4/5" />
      </section>

      <FrameRule />
      <ul className="flex flex-col gap-3 px-inset py-8">
        {promises.map((promise, i) => (
          <li
            key={promise}
            style={rise(2 + i).style}
            className={cn("flex items-center gap-3 text-caption", rise(2 + i).className)}
          >
            <Sparkle className="size-2.5 text-accent" />
            {promise}
          </li>
        ))}
      </ul>

      {/* Pinned to the foot of the panel on tall screens */}
      <div className="mt-auto">
        <FrameRule />
        <div
          style={rise(2 + promises.length).style}
          className={cn("px-inset py-8", rise(2 + promises.length).className)}
        >
          <BlobButton href="/shop" onClick={onClose} block>
            Shop all
          </BlobButton>
        </div>
      </div>
    </Rails>
  );
}

export default function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const close = useCartStore((s) => s.close);
  const { cart, lines, count, loading, busy, increment, decrement, removeItem } = useCart();

  const footer = lines.length ? (
    <div
      style={drawerRise(isOpen, lines.length).style}
      className={cn("flex flex-col gap-4", drawerRise(isOpen, lines.length).className)}
    >
      <dl className="flex flex-col gap-2">
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
      <p className="flex items-center gap-2 text-caption text-muted">
        <Sparkle className="size-2.5 text-accent" />
        Shipping and taxes are calculated at checkout.
      </p>
      <BlobButton href="/checkout" onClick={close} block icon={<RiLockLine className="size-4" />}>
        Checkout
      </BlobButton>
    </div>
  ) : null;

  return (
    <Drawer
      name="cart-drawer"
      open={isOpen}
      onClose={close}
      title={`Your bag (${count})`}
      heading={
        <h2 className="flex items-center gap-3 text-h5">
          Your bag
          <span className="center h-6 min-w-6 rounded-full bg-accent px-2 text-micro text-paper tabular-nums">
            {count}
          </span>
        </h2>
      }
      footer={footer}
    >
      {loading ? (
        <Rails>
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4 border-b border-line px-inset py-6">
              <Skeleton className="h-28 w-22 rounded-2xl" />
              <div className="flex flex-1 flex-col gap-2 pt-1">
                <Skeleton className="h-4 w-3/4 rounded-full" />
                <Skeleton className="h-4 w-1/3 rounded-full" />
              </div>
            </div>
          ))}
        </Rails>
      ) : lines.length === 0 ? (
        <EmptyBag open={isOpen} onClose={close} />
      ) : (
        <Rails>
          <ul className="flex flex-col divide-y divide-line">
            {lines.map((line, i) => {
              const href = line.product?.slug ? productHref(line.product.slug) : "/shop";
              const key = `${line.productId}-${line.variantDetail?.variantDetailId ?? ""}`;
              return (
                <li
                  key={key}
                  style={drawerRise(isOpen, i).style}
                  className={cn("flex gap-4 px-inset py-6", drawerRise(isOpen, i).className)}
                >
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
                    {/* items-baseline: the name (h6) and price (body) have different leading */}
                    <div className="flex items-baseline justify-between gap-4">
                      <Link href={href} onClick={close} className="text-h6 transition-colors hover:text-accent">
                        {line.name}
                      </Link>
                      <span className="shrink-0 text-body font-medium tabular-nums">
                        {formatPrice(line.finalPrice)}
                      </span>
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
        </Rails>
      )}
    </Drawer>
  );
}
