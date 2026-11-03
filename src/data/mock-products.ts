/*
 * Demo catalogue used while z-commerce isn't configured (see isApiConfigured),
 * shaped exactly like the API's data so pages don't care where it came from.
 * Safe to delete once the store is live.
 */
import type { Asset, Category, Product, Variant } from "@/types";

export const mockCategories: Category[] = [{ _id: "cat-sticks", name: "Antiperspirant Sticks", slug: "sticks" }];

const [sticks] = mockCategories;

const SIZES = ["100ml", "50ml"];
const PACKS = ["Pack of 01", "Pack of 02", "Pack of 04"];
/** ₹ for each pack, in PACKS order */
const PRICES: Record<string, number[]> = { "100ml": [335, 550, 850], "50ml": [225, 399, 699] };

/** The range's own shots in public/images/products/<range>/ — the front is featured */
const VIEWS = [
  ["front", "front"],
  ["angle", "three-quarter view"],
  ["back", "back, with the directions for use"],
  ["base", "lying down, showing the twist-up dial"],
] as const;

/** Lifestyle and how-it-works images every range shares (public/images/products/shared/); the first shows on hover */
const SHARED: Asset[] = [
  {
    path: "/images/products/shared/sava-lifestyle-holding.png",
    altText: "A smiling woman holding a SAVA stick, captioned “SAVA underarm care”",
    isHover: true,
  },
  {
    path: "/images/products/shared/sava-very-local.png",
    altText: "A woman with her arm raised after a workout, captioned “Your antiperspirant is actually very local”",
  },
  {
    path: "/images/products/shared/sava-sweat-ducts.png",
    altText: "Cross-section of skin: SAVA works inside the sweat ducts where you apply it",
  },
  {
    path: "/images/products/shared/sava-less-sweat.png",
    altText: "Close-up of an underarm, captioned “Less sweat reaches the skin”",
  },
].map((asset) => ({ type: "image", ...asset }));

const KEY_INGREDIENTS =
  "A sweat-control complex with skin-conditioning botanical oils and time-release fragrance micro-capsules. Free from paraben preservatives, denatured alcohols and artificial dyes.";

interface Copy {
  scent: string;
  benefits: string;
  aroma: string;
}

/** `range` names the stick: "balanced" → Sava Balanced, /shop/sava-balanced, images in products/balanced/ */
const make = (i: number, range: string, copy: Copy, extra: Partial<Product> = {}): Product => {
  const id = `demo-${i}`;
  const name = `Sava ${range[0].toUpperCase()}${range.slice(1)}`;
  const [front, ...angles] = VIEWS.map(([view, shot], v) => ({
    path: `/images/products/${range}/sava-${range}-${view}.jpg`,
    type: "image",
    altText: `${name} antiperspirant stick, ${shot}`,
    isFeatured: v === 0,
  }));
  // Every size in every pack
  const variants: Variant[] = SIZES.flatMap((size) =>
    PACKS.map((pack, p) => ({
      _id: `${id}-${size}-${p + 1}`,
      selectedOptions: [size, pack],
      variantPrice: PRICES[size][p],
      sku: `${id}-${size}-P${p + 1}`.toUpperCase(),
      stockQuantity: 10,
      stockStatus: "IN_STOCK" as const,
    })),
  );

  return {
    _id: id,
    name,
    slug: `sava-${range}`,
    price: PRICES[SIZES[0]][0],
    discountedPrice: null,
    description: `${name} is built on one promise: to keep up with you. Its dual-action formula controls sweat and neutralises odour where they start, while ${copy.scent} — ${copy.aroma.replace(/\.$/, "")} — unfolds slowly through the day. It glides on clear and stays comfortable from the first commute to the last rep.`,
    // Gallery order: the front, the shared images, then the range's other angles
    assets: [front, ...SHARED, ...angles],
    categoryIds: [sticks._id],
    categories: [sticks],
    productOptions: [
      { optionName: "Size", choices: SIZES.map((choice) => ({ name: choice })) },
      { optionName: "Pack", choices: PACKS.map((choice) => ({ name: choice })) },
    ],
    variants,
    additionalInfo: [
      { title: "Benefits", description: copy.benefits },
      { title: "Key Ingredients", description: KEY_INGREDIENTS },
      { title: "Aroma", description: `${copy.scent}: ${copy.aroma}` },
    ],
    status: "PUBLISHED",
    ...extra,
  };
};

// Kinetic, Balanced, Renewed first: the home page's bestsellers show the first three, Balanced in the middle
export const mockProducts: Product[] = [
  make(1, "kinetic", {
    scent: "Silver Lining",
    benefits: "Advanced sweat control with a crisp, energising scent, made for days that don't slow down.",
    aroma: "bright citrus peel and cool mineral notes over a clean musk.",
  }),
  make(
    2,
    "balanced",
    {
      scent: "Citrus Tide",
      benefits:
        "SAVA combines effective sweat control and refined fragrance for lasting freshness, comfort and everyday confidence.",
      aroma: "sparkling bergamot and grapefruit over a soft sea-salt accord.",
    },
    { ribbon: { name: "Best Seller" } },
  ),
  make(3, "renewed", {
    scent: "Forest Air",
    benefits: "Dual-action sweat and odour defence with a fresh, green scent that keeps you feeling reset all day.",
    aroma: "green fig leaf, crushed pine needles and vetiver.",
  }),
  make(
    4,
    "grounded",
    {
      scent: "Amber Wood",
      benefits: "Long-lasting sweat control wrapped in a warm, woody fragrance that stays close and steady.",
      aroma: "warm amber, cedarwood and a hint of spice on a smooth woody base.",
    },
    { ribbon: { name: "New" } },
  ),
];
