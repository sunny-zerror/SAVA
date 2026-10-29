/*
 * Demo catalogue used while z-commerce isn't configured (see isApiConfigured),
 * shaped exactly like the API's data so pages don't care where it came from.
 * Safe to delete once the store is live.
 */
import type { Category, Product, Variant } from "@/types";
import { PLACEHOLDER_IMAGE } from "@/utils/media";

export const mockCategories: Category[] = [
  { _id: "cat-tops", name: "Tops", slug: "tops" },
  { _id: "cat-bottoms", name: "Bottoms", slug: "bottoms" },
  { _id: "cat-accessories", name: "Accessories", slug: "accessories" },
];

const sizes = ["S", "M", "L", "XL"];

const variantsFor = (id: string, price: number, soldOut: string[] = []): Variant[] =>
  sizes.map((size) => ({
    _id: `${id}-${size}`,
    selectedOptions: [size],
    variantPrice: price,
    sku: `${id.toUpperCase()}-${size}`,
    stockQuantity: soldOut.includes(size) ? 0 : 10,
    stockStatus: soldOut.includes(size) ? "OUT_OF_STOCK" : "IN_STOCK",
  }));

const make = (
  i: number,
  name: string,
  category: Category,
  price: number,
  extra: Partial<Product> = {},
  soldOut: string[] = [],
): Product => {
  const id = `demo-${i}`;
  return {
    _id: id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    price,
    discountedPrice: null,
    description: `${name} — a placeholder product from the demo catalogue. Connect z-commerce in .env.local to load the real collection.`,
    assets: [
      { path: PLACEHOLDER_IMAGE, type: "image", altText: name, isFeatured: true },
      { path: PLACEHOLDER_IMAGE, type: "image", altText: `${name} — detail`, isHover: true },
    ],
    categoryIds: [category._id],
    categories: [category],
    productOptions: [{ optionName: "Size", choices: sizes.map((name) => ({ name })) }],
    variants: variantsFor(id, price, soldOut),
    additionalInfo: [
      { title: "Details", description: "Composition, fit and origin go here." },
      { title: "Shipping & Returns", description: "Delivery times and the returns window go here." },
    ],
    status: "PUBLISHED",
    ...extra,
  };
};

const [tops, bottoms, accessories] = mockCategories;

export const mockProducts: Product[] = [
  make(1, "Classic Cotton Tee", tops, 1499, { ribbon: { name: "New" } }),
  make(2, "Relaxed Linen Shirt", tops, 2999),
  make(3, "Wide-Leg Trousers", bottoms, 3499, {}, ["S"]),
  make(4, "Everyday Joggers", bottoms, 2499, { discountedPrice: 1999, ribbon: { name: "Sale" } }),
  make(5, "Knit Polo", tops, 2799),
  make(6, "Pleated Shorts", bottoms, 1999),
  make(7, "Canvas Tote", accessories, 999, {
    productOptions: [],
    variants: [{ _id: "demo-7-default", selectedOptions: [], variantPrice: 999, stockStatus: "IN_STOCK" }],
  }),
  make(8, "Wool Beanie", accessories, 1299, {}, ["S", "M", "L", "XL"]),
];
