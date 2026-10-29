import type { Asset } from "@/types";

export const PLACEHOLDER_IMAGE = "/images/placeholder/product.svg";

/** z-commerce asset paths are usually absolute CDN URLs; local paths pass through */
export const mediaUrl = (path?: string | null) => path || PLACEHOLDER_IMAGE;

const isImage = (a: Asset) => !a.type || a.type.startsWith("image");

/** Featured image first, then the rest, skipping videos and size guides */
export function productImages(assets: Asset[] = []): Asset[] {
  const images = assets.filter((a) => isImage(a) && !a.isSizeGuide);
  return [...images].sort((a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured)));
}

export const primaryImage = (assets: Asset[] = []) => productImages(assets)[0];

/** The image to swap in on hover, if the client flagged one */
export const hoverImage = (assets: Asset[] = []) => assets.find((a) => a.isHover && isImage(a));
