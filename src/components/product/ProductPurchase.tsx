"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import Price from "@/components/ui/Price";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types";
import { cn } from "@/utils/cn";
import { displayPrice, findVariant, isOutOfStock, toVariantDetail } from "@/utils/product";

/** Option pickers + add to bag. A variant is matched once every option has a choice. */
export default function ProductPurchase({ product }: { product: Product }) {
  const options = product.productOptions ?? [];
  const variants = product.variants ?? [];
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const { addItem, busy } = useCart();
  const openCart = useCartStore((s) => s.open);

  const complete = options.every((o) => selected[o.optionName]);
  // Products without options sell their single variant directly
  const variant =
    options.length === 0 ? variants[0] : complete ? findVariant(variants, Object.values(selected)) : undefined;
  const soldOut = variant ? isOutOfStock(variant) : variants.length > 0 && variants.every((v) => isOutOfStock(v));
  const { price, compareAt } = displayPrice(product);
  const shownPrice = variant?.variantPrice && !compareAt ? variant.variantPrice : price;

  /** A choice is unavailable if every variant containing it (with the other picks) is sold out */
  const choiceSoldOut = (optionName: string, choice: string) => {
    const picks = Object.entries({ ...selected, [optionName]: choice }).map(([, v]) => v);
    const matches = variants.filter((v) => picks.every((p) => v.selectedOptions?.includes(p)));
    return matches.length > 0 && matches.every((v) => isOutOfStock(v));
  };

  async function onAdd() {
    if (!variant) {
      const missing = options.filter((o) => !selected[o.optionName]).map((o) => o.optionName.toLowerCase());
      setError(missing.length ? `Please choose ${missing.join(" and ")}.` : "This combination isn't available.");
      return;
    }
    setError("");
    const added = await addItem({
      productId: product._id,
      categoryId: product.categoryIds?.[0],
      variant: toVariantDetail(variant),
    });
    if (added) openCart();
  }

  return (
    // Price, each option, then the button rise in turn under the heading's reveal
    <div data-reveal="stagger" className="flex flex-col gap-6">
      <Price price={shownPrice} compareAt={compareAt} className="text-body-lg" />

      {options.map((option) => (
        <fieldset key={option.optionName} className="flex flex-col gap-3">
          <legend className="mb-3 text-eyebrow text-muted">
            {option.optionName}
            {selected[option.optionName] && <span className="ml-2 text-ink">{selected[option.optionName]}</span>}
          </legend>
          <div className="flex flex-wrap gap-2">
            {option.choices.map((choice) => {
              const active = selected[option.optionName] === choice.name;
              const unavailable = choiceSoldOut(option.optionName, choice.name);
              return (
                <button
                  key={choice.name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setSelected((s) => ({ ...s, [option.optionName]: choice.name }));
                    setError("");
                  }}
                  className={cn(
                    "h-11 min-w-12 border px-4 text-caption transition-colors",
                    active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                    unavailable && "text-muted line-through",
                  )}
                >
                  {choice.name}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      <div className="flex flex-col gap-2">
        <Button size="lg" fullWidth loading={busy} disabled={soldOut} onClick={onAdd}>
          {soldOut ? "Sold out" : "Add to bag"}
        </Button>
        {error && (
          <p role="alert" className="text-caption text-sale">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
