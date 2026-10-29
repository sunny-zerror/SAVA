import type { Metadata } from "next";
import { siteConfig, siteRoutes } from "@/config/site";
import { absoluteUrl, normalizePath } from "@/utils/url";

interface CreateMetadataOptions {
  title?: string;
  /** skip the "%s | Brand" template (home page, brand-led titles) */
  absoluteTitle?: boolean;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  type?: "website" | "article";
  noIndex?: boolean;
}

export function createMetadata({
  title,
  absoluteTitle = false,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  imageAlt,
  keywords = siteConfig.keywords,
  type = "website",
  noIndex = false,
}: CreateMetadataOptions = {}): Metadata {
  const url = absoluteUrl(path);
  const pageTitle = title || siteConfig.name;
  const branded = absoluteTitle || pageTitle.includes(siteConfig.name);
  const socialTitle = branded ? pageTitle : `${pageTitle} | ${siteConfig.name}`;
  const imageUrl = absoluteUrl(image);

  return {
    title: branded ? { absolute: pageTitle } : pageTitle,
    description,
    keywords,
    robots: noIndex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    alternates: { canonical: noIndex ? null : url },
    openGraph: {
      type,
      locale: siteConfig.locale,
      siteName: siteConfig.name,
      title: socialTitle,
      description,
      url,
      images: [{ url: imageUrl, alt: imageAlt || pageTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
      ...(siteConfig.twitterHandle ? { site: siteConfig.twitterHandle } : {}),
    },
  };
}

/** Root layout metadata: defaults + the "%s | Brand" title template */
export function createRootMetadata(): Metadata {
  return {
    ...createMetadata(),
    metadataBase: new URL(siteConfig.url),
    applicationName: siteConfig.name,
    title: { default: `${siteConfig.name} — ${siteConfig.tagline}`, template: `%s | ${siteConfig.name}` },
    formatDetection: { telephone: false, address: false, email: false },
  };
}

/** Metadata for a static page listed in siteRoutes */
export function createPageMetadata(path: string): Metadata {
  const route = siteRoutes.find((r) => r.path === normalizePath(path));
  return createMetadata({
    title: route?.title,
    absoluteTitle: route?.path === "/",
    description: route?.description,
    path,
  });
}
