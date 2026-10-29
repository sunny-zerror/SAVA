import { siteConfig } from "@/config/site";

export function normalizePath(path = "/"): string {
  if (!path || path === "/") return "/";
  return `/${path}`.replace(/\/+/g, "/").replace(/\/$/, "");
}

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const base = siteConfig.url.replace(/\/+$/, "");
  const normalized = normalizePath(path);
  return normalized === "/" ? base : `${base}${normalized}`;
}

export const productHref = (slug: string) => `/shop/${slug}`;
