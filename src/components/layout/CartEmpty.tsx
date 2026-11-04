"use client";

import { RiAddLine, RiLoader4Line } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import BlobButton from "@/components/ui/BlobButton";
import Price from "@/components/ui/Price";
import Sparkle from "@/components/ui/Sparkle";
import { productContent } from "@/data/product-content";
import { useQuickAdd } from "@/hooks/useQuickAdd";
import { gsap, useGSAP } from "@/lib/gsap";
import type { ProductSummary } from "@/types";
import { mediaUrl, primaryImage } from "@/utils/media";
import { cardVariant, displayPrice } from "@/utils/product";
import { productHref } from "@/utils/url";

/** A block that rises into its own overflow-hidden mask with the drawer's content (useDrawerMotion) */
function Line({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden">
      <div data-drawer-line className={className}>
        {children}
      </div>
    </div>
  );
}

/** One suggestion: thumbnail, name and scent (the row opens the product), price, and a quick add */
function Suggestion({ product, onNavigate }: { product: ProductSummary; onNavigate: () => void }) {
  const { add, loading, busy } = useQuickAdd();
  const image = primaryImage(product.assets);
  const variant = cardVariant(product);
  // Priced like the listing card: the variant it adds, or its sale price
  const listed = variant?.variantPrice || displayPrice(product).price;
  const sale = product.discountedPrice && product.discountedPrice < listed ? product.discountedPrice : null;
  const scent = productContent[product.slug]?.scent;

  return (
    <li className="relative">
      <span aria-hidden="true" data-drawer-rule className="absolute inset-x-0 bottom-0 h-px bg-line" />
      <Line className="group/suggestion relative flex items-center gap-4 py-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-surface">
          <Image
            src={mediaUrl(image?.path)}
            alt=""
            fill
            sizes="80px"
            // As on the listing card: the shot's white backdrop takes the tint
            className="object-cover mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover/suggestion:scale-108"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-h6">
            {/* Stretched link: the row opens the product; the add button sits above it */}
            <Link href={productHref(product.slug)} onClick={onNavigate} className="after:absolute after:inset-0">
              {product.name}
            </Link>
          </p>
          {scent && <p className="text-caption text-muted">{scent}</p>}
          <Price price={sale ?? listed} compareAt={sale ? listed : null} className="text-body font-medium" />
        </div>
        <button
          type="button"
          onClick={() =>
            add({
              slug: product.slug,
              productId: product._id,
              categoryId: product.categoryIds?.[0] ?? undefined,
              selectedOptions: variant?.selectedOptions ?? [],
            })
          }
          disabled={busy || loading}
          aria-label={`Add ${product.name} to bag`}
          className="relative z-10 center size-11 shrink-0 rounded-full border border-line transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {loading ? (
            <RiLoader4Line aria-hidden="true" className="size-4.5 animate-spin" />
          ) : (
            <RiAddLine
              aria-hidden="true"
              className="size-4.5 transition-transform duration-500 ease-out-expo group-hover/suggestion:rotate-90"
            />
          )}
        </button>
      </Line>
    </li>
  );
}

interface CartEmptyProps {
  suggestions: ProductSummary[];
  /** The drawer is already open as this mounts (the last item was just removed) */
  enter: boolean;
  onNavigate: () => void;
}

/**
 * The empty bag: a short note and Shop all, then a few products to start with. Its lines and
 * hairlines move with the drawer's own rise and sink (useDrawerMotion); mounted into a drawer that's
 * already open, they rise in the same way by themselves.
 */
export default function CartEmpty({ suggestions, enter, onNavigate }: CartEmptyProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!enter) return;
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ defaults: { ease: "expo.out", overwrite: "auto" } })
          .fromTo(
            "[data-drawer-rule]",
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1.4, stagger: 0.09 },
            0,
          )
          .fromTo("[data-drawer-line]", { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.09 }, 0);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="flex flex-1 flex-col">
      <div
        className={
          suggestions.length
            ? "flex flex-col items-center gap-6 py-10 text-center"
            : "flex flex-1 flex-col items-center justify-center gap-6 py-section text-center"
        }
      >
        <Line className="flex flex-col items-center gap-2">
          <p className="text-h4">Your bag is empty</p>
          <p className="text-body text-muted">Add a stick and it&apos;ll wait for you here.</p>
        </Line>
        <Line className="w-56">
          <BlobButton href="/shop" onClick={onNavigate} block>
            Shop all
          </BlobButton>
        </Line>
      </div>

      {suggestions.length > 0 && (
        <section aria-labelledby="cart-suggestions">
          <Line className="pb-2">
            <h3 id="cart-suggestions" className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              You might like
            </h3>
          </Line>
          <span aria-hidden="true" data-drawer-rule className="block h-px bg-line" />
          <ul className="flex flex-col">
            {suggestions.map((product) => (
              <Suggestion key={product._id} product={product} onNavigate={onNavigate} />
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
