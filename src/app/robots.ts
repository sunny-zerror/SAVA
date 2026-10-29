import type { MetadataRoute } from "next";
import { privatePaths, siteConfig } from "@/config/site";
import { absoluteUrl } from "@/utils/url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...privatePaths, "/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
