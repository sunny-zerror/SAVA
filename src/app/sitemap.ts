import type { MetadataRoute } from "next";
import { siteRoutes } from "@/config/site";
import { getCategories, getProducts } from "@/services/catalog";
import { mediaUrl, primaryImage } from "@/utils/media";
import { absoluteUrl, productHref } from "@/utils/url";

// Rebuilt hourly so new products appear without a deploy
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [{ products }, categories] = await Promise.all([getProducts({ limit: 1000 }), getCategories()]);

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

  const productPages: MetadataRoute.Sitemap = products.map((p) => {
    const image = primaryImage(p.assets);
    return {
      url: absoluteUrl(productHref(p.slug)),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      ...(image ? { images: [absoluteUrl(mediaUrl(image.path))] } : {}),
    };
  });

  return [...pages, ...categoryPages, ...productPages];
}
