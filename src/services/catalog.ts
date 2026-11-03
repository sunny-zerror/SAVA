/*
 * Catalogue reads for Server Components. Pages call these, never Apollo directly,
 * so the data source (z-commerce or the demo catalogue) is decided in one place.
 * React's cache() dedupes calls made by generateMetadata and the page in one request.
 */
import { cache } from "react";
import { mockCategories, mockProducts } from "@/data/mock-products";
import { productContent } from "@/data/product-content";
import { GET_CATEGORIES, GET_CATEGORY, GET_PRODUCT, GET_PRODUCTS } from "@/graphql";
import { query } from "@/lib/apollo/server";
import { isApiConfigured } from "@/lib/env";
import type { Category, Product, ProductSummary } from "@/types";

export const PAGE_SIZE = 12;

export interface ProductPage {
  products: ProductSummary[];
  totalCount: number;
}

const empty: ProductPage = { products: [], totalCount: 0 };

function logError(scope: string, error: unknown) {
  console.error(`[catalog] ${scope} failed:`, error instanceof Error ? error.message : error);
}

export const getProducts = cache(
  async ({ page = 1, limit = PAGE_SIZE }: { page?: number; limit?: number } = {}): Promise<ProductPage> => {
    const offset = (page - 1) * limit;
    if (!isApiConfigured) {
      return { products: mockProducts.slice(offset, offset + limit), totalCount: mockProducts.length };
    }
    try {
      const { data } = await query({ query: GET_PRODUCTS, variables: { limit, offset } });
      return data?.getClientSideProducts ?? empty;
    } catch (error) {
      logError("getProducts", error);
      return empty;
    }
  },
);

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  if (!isApiConfigured) return mockProducts.find((p) => p.slug === slug) ?? null;
  try {
    const { data } = await query({ query: GET_PRODUCT, variables: { slug } });
    return data?.getClientSideProductById ?? null;
  } catch (error) {
    logError(`getProduct(${slug})`, error);
    return null;
  }
});

/** Products sharing the first category, for the product page's related carousel */
export const getRelatedProducts = cache(async (product: Product, limit = 8): Promise<ProductSummary[]> => {
  const slug = product.categories?.[0]?.slug;
  const pool = slug ? (await getCategoryProducts(slug))?.products : (await getProducts()).products;
  return (pool ?? []).filter((p) => p._id !== product._id).slice(0, limit);
});

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isApiConfigured) return mockCategories;
  try {
    const { data } = await query({ query: GET_CATEGORIES, variables: { limit: 50 } });
    return data?.getClientSideCategories.categories ?? [];
  } catch (error) {
    logError("getCategories", error);
    return [];
  }
});

/** How many products a search looks through — the whole catalogue, at its current size */
const SEARCH_POOL = 100;

/**
 * The shop's search (/shop?q=): products whose name, scent or tagline (src/data/product-content.ts)
 * contains every word of the term, case-insensitive, a page at a time. z-commerce's product filters
 * don't document a text search, so the catalogue is fetched and matched here — move this to the API
 * if the range outgrows SEARCH_POOL.
 */
export const searchProducts = cache(async (term: string, page = 1): Promise<ProductPage> => {
  const words = term.toLowerCase().split(/\s+/).filter(Boolean);
  const { products } = await getProducts({ limit: SEARCH_POOL });
  const matches = products.filter((p) => {
    const content = productContent[p.slug];
    const text = [p.name, content?.scent, content?.tagline].filter(Boolean).join(" ").toLowerCase();
    return words.every((word) => text.includes(word));
  });
  const offset = (page - 1) * PAGE_SIZE;
  return { products: matches.slice(offset, offset + PAGE_SIZE), totalCount: matches.length };
});

export const getCategoryProducts = cache(
  async (slug: string, page = 1): Promise<(ProductPage & { category: Category }) | null> => {
    const offset = (page - 1) * PAGE_SIZE;
    if (!isApiConfigured) {
      const category = mockCategories.find((c) => c.slug === slug);
      if (!category) return null;
      const all = mockProducts.filter((p) => p.categoryIds?.includes(category._id));
      return { category, products: all.slice(offset, offset + PAGE_SIZE), totalCount: all.length };
    }
    try {
      const { data } = await query({ query: GET_CATEGORY, variables: { slug, limit: PAGE_SIZE, offset } });
      const result = data?.getClientSideCategory;
      if (!result) return null;
      const { products, productsCount, ...category } = result;
      return { category, products, totalCount: productsCount };
    } catch (error) {
      logError(`getCategoryProducts(${slug})`, error);
      return null;
    }
  },
);
