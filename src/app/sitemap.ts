import type { MetadataRoute } from "next";
import { siteRoutes } from "@/config/site";
import { getCategories } from "@/services/catalog";
import { absoluteUrl } from "@/utils/url";

// Rebuilt hourly so new categories appear without a deploy
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const categories = await getCategories();

  const pages: MetadataRoute.Sitemap = siteRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.path === "/" || route.path === "/shop" ? "daily" : "monthly",
    priority: route.priority,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: absoluteUrl(`/shop?category=${c.slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...pages, ...categoryPages];
}
