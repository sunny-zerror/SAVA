/*
 * Copy that z-commerce doesn't carry: the scent under a listing card's name, and on the product page
 * the tagline, review score, at-a-glance rows and the About tab's lists. Keyed by product slug; a
 * product without an entry just leaves them out. Dummy content for now — swap in the real figures
 * (or move them to the API) before launch.
 */

export interface ProductHighlight {
  /** Which icon sits beside the row (ProductDetails) */
  icon: "skin" | "apply";
  label: string;
  value: string;
}

export interface ProductContent {
  scent: string;
  tagline: string;
  rating: { score: number; count: number };
  highlights: ProductHighlight[];
  recommendedFor: string[];
  suitableFor: string[];
}

const highlights: ProductHighlight[] = [
  { icon: "skin", label: "Suited for", value: "All skin types" },
  { icon: "apply", label: "Application", value: "Twist up and apply to clean, dry underarms" },
];

// The About tab's lists — the same for every range
const audience = {
  recommendedFor: ["Daily urban commutes", "Active lifestyles", "Long, warm days", "Sensitive underarm skin"],
  suitableFor: ["All skin types, sensitive included", "Everyone — a unisex fragrance"],
};

export const productContent: Record<string, ProductContent> = {
  "sava-kinetic": {
    scent: "Silver Lining",
    tagline: "Sweat control. Energising freshness.",
    rating: { score: 4.5, count: 312 },
    highlights,
    ...audience,
  },
  "sava-balanced": {
    scent: "Citrus Tide",
    tagline: "Sweat control. Lasting freshness.",
    rating: { score: 4.6, count: 470 },
    highlights,
    ...audience,
  },
  "sava-renewed": {
    scent: "Forest Air",
    tagline: "Sweat control. A fresh green calm.",
    rating: { score: 4.4, count: 198 },
    highlights,
    ...audience,
  },
  "sava-grounded": {
    scent: "Amber Wood",
    tagline: "Sweat control. Warm, woody depth.",
    rating: { score: 4.7, count: 126 },
    highlights,
    ...audience,
  },
};
