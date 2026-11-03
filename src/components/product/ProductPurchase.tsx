"use client";

import { RiRepeat2Line, RiShoppingBag3Line } from "@remixicon/react";
import { useState } from "react";
import BlobButton from "@/components/ui/BlobButton";
import { productPickers } from "@/config/shop";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { toast } from "@/store/toast-store";
import type { Product, ProductOption } from "@/types";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";
import { displayPrice, findVariant, isOutOfStock, toVariantDetail } from "@/utils/product";
import { productHref } from "@/utils/url";

interface ProductPurchaseProps {
  product: Product;
  /** The page's h1 — rendered by the server, so the heading reveal owns its DOM */
  title: React.ReactNode;
  /** Shown under the title row (tagline, rating) */
  children?: React.ReactNode;
}

type Picks = Record<string, string>;

/** Opens on the default pack and every other option's first choice */
const initialPicks = (options: ProductOption[]): Picks =>
  Object.fromEntries(
    options.map(({ optionName, choices }) => {
      const pack = optionName === productPickers.pack && choices.some((c) => c.name === productPickers.defaultPack);
      return [optionName, pack ? productPickers.defaultPack : (choices[0]?.name ?? "")];
    }),
  );

/** "Pack of 04" → 4 */
const packCount = (choice: string) => Number.parseInt(choice.replace(/\D+/g, ""), 10) || 1;

/**
 * Name, pickers and the buttons: size pills beside the name, the price for the picks, a priced card
 * per pack, then Subscribe and Add To Cart. Every pick is always made, so a variant is matched as
 * soon as the page opens.
 */
export default function ProductPurchase({ product, title, children }: ProductPurchaseProps) {
  const options = product.productOptions ?? [];
  const variants = product.variants ?? [];
  const sizeOption = options.find((o) => o.optionName === productPickers.size);
  const packOption = options.find((o) => o.optionName === productPickers.pack);
  const otherOptions = options.filter((o) => o !== sizeOption && o !== packOption);

  const [picks, setPicks] = useState(() => initialPicks(options));
  const { addItem, busy } = useCart();
  const openCart = useCartStore((s) => s.open);
  const href = productHref(product.slug);

  /** The variant the picks select, with `choice` swapped in for its option */
  const variantWith = (optionName: string, choice: string) =>
    findVariant(variants, Object.values({ ...picks, [optionName]: choice }));
  const pick = (optionName: string, choice: string) => setPicks((p) => ({ ...p, [optionName]: choice }));
  const unavailable = (optionName: string, choice: string) => {
    const match = variantWith(optionName, choice);
    return !match || isOutOfStock(match);
  };

  const variant = options.length === 0 ? variants[0] : findVariant(variants, Object.values(picks));
  const soldOut = !variant || isOutOfStock(variant);
  const price = variant?.variantPrice ?? displayPrice(product).price;
  // A multi-pack against that many singles in the same size
  const firstPack = packOption?.choices[0]?.name;
  const single = packOption && firstPack ? variantWith(packOption.optionName, firstPack) : undefined;
  const compareAt = packOption && single ? single.variantPrice * packCount(picks[packOption.optionName]) : null;

  async function onAdd() {
    if (!variant) return;
    const added = await addItem({
      productId: product._id,
      categoryId: product.categoryIds?.[0],
      variant: toVariantDetail(variant),
    });
    if (added) openCart();
  }

  return (
    // Under the heading's line reveal, the rest rises in: the size pills, then the tagline and
    // rating, the price, and the pickers and buttons in turn
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 pb-6">
        <div className="flex items-start justify-between gap-4">
          {title}
          {sizeOption && (
            <fieldset data-reveal className="flex shrink-0 gap-1.5 pt-1">
              <legend className="sr-only">{sizeOption.optionName}</legend>
              <Choices
                option={sizeOption}
                picked={picks[sizeOption.optionName]}
                onPick={pick}
                unavailable={unavailable}
              />
            </fieldset>
          )}
        </div>
        {children && (
          <div data-reveal="stagger" className="flex flex-col gap-2">
            {children}
          </div>
        )}
      </div>

      <div data-reveal className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-y border-line py-5">
        <p className="text-body-lg font-medium tabular-nums">MRP {formatPrice(price)}</p>
        {compareAt != null && compareAt > price && (
          <s className="text-caption text-muted tabular-nums">
            <span className="sr-only">Was </span>
            {formatPrice(compareAt)}
          </s>
        )}
        <p className="text-micro text-muted">(Incl. of all taxes)</p>
      </div>

      <div data-reveal="stagger" className="flex flex-col gap-6 pt-6">
        {otherOptions.map((option) => (
          <fieldset key={option.optionName} className="flex flex-wrap gap-2">
            <legend className="mb-3 text-eyebrow text-muted">{option.optionName}</legend>
            <Choices option={option} picked={picks[option.optionName]} onPick={pick} unavailable={unavailable} />
          </fieldset>
        ))}

        {packOption && (
          <fieldset>
            <legend className="sr-only">{packOption.optionName}</legend>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(6rem,1fr))] gap-2">
              {packOption.choices.map((choice) => {
                const match = variantWith(packOption.optionName, choice.name);
                const active = picks[packOption.optionName] === choice.name;
                const tier = productPickers.packTiers[choice.name];
                return (
                  <button
                    key={choice.name}
                    type="button"
                    aria-pressed={active}
                    disabled={!match}
                    onClick={() => pick(packOption.optionName, choice.name)}
                    className={cn(
                      "flex flex-col overflow-hidden rounded-xl border text-center transition-colors disabled:opacity-50",
                      active ? "border-accent" : "border-line hover:border-accent/50",
                    )}
                  >
                    {tier && (
                      <span
                        className={cn(
                          "py-1.5 text-micro font-medium transition-colors",
                          active ? "bg-accent text-paper" : "bg-surface text-muted",
                        )}
                      >
                        {tier}
                      </span>
                    )}
                    <span className="flex flex-col gap-0.5 px-2 py-3">
                      <span className="text-caption">{choice.name}</span>
                      <span className="text-body font-medium tabular-nums">
                        {match ? formatPrice(match.variantPrice) : "—"}
                      </span>
                      {match && isOutOfStock(match) && <span className="text-micro text-sale">Sold out</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {/* SAVA's BlobButtons, full width. Always links (to this page, so they work before JS); the
            click is the action */}
        <div className="grid gap-3 sm:grid-cols-2">
          <BlobButton
            href={href}
            block
            tone="soft"
            icon={<RiRepeat2Line className="size-4" />}
            onClick={(event) => {
              event.preventDefault();
              toast.info("Subscribe & save is coming soon.");
            }}
          >
            Subscribe to save
          </BlobButton>
          <BlobButton
            href={href}
            block
            icon={<RiShoppingBag3Line className="size-4" />}
            aria-disabled={soldOut || undefined}
            onClick={(event) => {
              event.preventDefault();
              if (soldOut || busy) return;
              void onAdd();
            }}
            className="aria-disabled:opacity-60"
          >
            {!variant ? "Unavailable" : soldOut ? "Sold Out" : busy ? "Adding…" : "Add To Cart"}
          </BlobButton>
        </div>
      </div>
    </div>
  );
}

interface ChoicesProps {
  option: ProductOption;
  picked: string | undefined;
  onPick: (optionName: string, choice: string) => void;
  unavailable: (optionName: string, choice: string) => boolean;
}

/** One pill per choice; a choice that can't be bought with the other picks is struck through */
function Choices({ option, picked, onPick, unavailable }: ChoicesProps) {
  return option.choices.map((choice) => {
    const active = picked === choice.name;
    return (
      <button
        key={choice.name}
        type="button"
        aria-pressed={active}
        onClick={() => onPick(option.optionName, choice.name)}
        className={cn(
          "h-8 rounded-full border px-3.5 text-caption tabular-nums transition-colors",
          active ? "border-accent bg-accent text-paper" : "border-line hover:border-accent",
          !active && unavailable(option.optionName, choice.name) && "text-muted line-through",
        )}
      >
        {choice.name}
      </button>
    );
  });
}
