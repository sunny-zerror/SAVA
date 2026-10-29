import { siteConfig } from "@/config/site";

const priceFormatter = new Intl.NumberFormat(siteConfig.language, {
  style: "currency",
  currency: siteConfig.currency,
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
});

export const formatPrice = (amount: number | null | undefined) => priceFormatter.format(amount ?? 0);

export const formatDate = (iso: string | number) =>
  new Intl.DateTimeFormat(siteConfig.language, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(typeof iso === "string" && /^\d+$/.test(iso) ? Number(iso) : iso),
  );

/** "processing" / "IN_TRANSIT" → "Processing" / "In transit" */
export const humanize = (value?: string | null) =>
  value
    ? value
        .replace(/[_-]+/g, " ")
        .toLowerCase()
        .replace(/^\w/, (c) => c.toUpperCase())
    : "";
