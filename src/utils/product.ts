import type { Product, ProductSummary, Variant, VariantDetail } from "@/types";

/** Price shown on cards: lowest variant price, else the product price */
export function displayPrice(product: ProductSummary | Product) {
  const variantPrices = (product.variants ?? []).map((v) => v.variantPrice).filter((p) => p > 0);
  const base = variantPrices.length ? Math.min(...variantPrices) : (product.price ?? 0);
  const sale = product.discountedPrice && product.discountedPrice > 0 ? product.discountedPrice : null;
  return { price: sale ?? base, compareAt: sale && sale < base ? base : null };
}

export const isOutOfStock = (v?: Pick<Variant, "stockStatus"> | null) => v?.stockStatus === "OUT_OF_STOCK";

export const isSoldOut = (product: ProductSummary | Product) =>
  Boolean(product.variants?.length) && product.variants!.every((v) => isOutOfStock(v));

/** Variant whose selectedOptions match the chosen choice names (order-insensitive) */
export function findVariant<V extends Pick<Variant, "selectedOptions">>(variants: V[] = [], selected: string[]) {
  const wanted = [...selected].sort();
  return variants.find((v) => {
    const options = [...(v.selectedOptions ?? [])].sort();
    return options.length === wanted.length && options.every((o, i) => o === wanted[i]);
  });
}

/** The variant a listing card sells: every option's first choice (the first variant when there are no options) */
export function cardVariant(product: ProductSummary) {
  const variants = product.variants ?? [];
  const options = product.productOptions ?? [];
  if (options.length === 0) return variants[0];
  return findVariant(
    variants,
    options.map((o) => o.choices[0]?.name ?? ""),
  );
}

/** Removes Apollo's __typename keys, which z-commerce input types reject */
export function stripTypename<T>(value: T): T {
  if (Array.isArray(value)) return value.map(stripTypename) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => key !== "__typename")
        .map(([key, v]) => [key, stripTypename(v)]),
    ) as T;
  }
  return value;
}

/** The variantDetail payload addItemToCart expects */
export function toVariantDetail(variant: Variant): VariantDetail {
  const { _id, ...rest } = stripTypename(variant);
  return { ...rest, variantDetailId: _id };
}
