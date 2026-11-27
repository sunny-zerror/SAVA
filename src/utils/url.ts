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

export const blogHref = (slug: string) => `/blogs/${slug}`;

/** The sign-in page, opened on its "Create account" side */
export const signupHref = "/login?mode=signup";

/** Only allow same-site redirect targets like "/account?tab=orders" */
export const safeNext = (next?: string | string[]) =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
