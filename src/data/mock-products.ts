/*
 * Demo catalogue used while z-commerce isn't configured (see isApiConfigured),
 * shaped exactly like the API's data so pages don't care where it came from.
 * Safe to delete once the store is live.
 */
import type { Category, Product } from "@/types";

export const mockCategories: Category[] = [{ _id: "cat-sticks", name: "Antiperspirant Sticks", slug: "sticks" }];

const [sticks] = mockCategories;

const make = (i: number, name: string, scent: string, image: string, extra: Partial<Product> = {}): Product => {
  const id = `demo-${i}`;
  return {
    _id: id,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    price: 335,
    discountedPrice: null,
    description: `${name} — ${scent}. Advanced sweat control with a refined, long-lasting fragrance. A demo product: connect z-commerce in .env.local to load the real catalogue.`,
    assets: [{ path: image, type: "image", altText: `${name} antiperspirant stick`, isFeatured: true }],
    categoryIds: [sticks._id],
    categories: [sticks],
    // Single-size sticks: no options, one variant sold directly
    productOptions: [],
    variants: [
      {
        _id: `${id}-100ml`,
        selectedOptions: [],
        variantPrice: 335,
        sku: `${id.toUpperCase()}-100ML`,
        stockQuantity: 10,
        stockStatus: "IN_STOCK",
      },
    ],
    additionalInfo: [
      { title: "Ingredients", description: "Free from paraben preservatives, denatured alcohols and artificial dyes." },
      { title: "Shipping & Returns", description: "Delivery times and the returns window go here." },
    ],
    status: "PUBLISHED",
    ...extra,
  };
};

export const mockProducts: Product[] = [
  make(1, "Sava Kinetic", "a crisp, energising scent", "/images/products/sava-kinetic.jpg"),
  make(2, "Sava Balanced", "citrus tide", "/images/products/sava-balanced.jpg", { ribbon: { name: "Bestseller" } }),
  make(3, "Sava Renewed", "a fresh, green scent", "/images/products/sava-renewed.jpg"),
];
