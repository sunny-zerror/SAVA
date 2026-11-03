import type { Metadata } from "next";
import { ViewTransition } from "react";
import ShopHero from "@/components/sections/shop/ShopHero";
import ShopProducts from "@/components/sections/shop/ShopProducts";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Frame } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import { productListSchema } from "@/lib/schema";
import { createMetadata, createPageMetadata } from "@/lib/seo";
import { getCategories, getCategoryProducts, getProducts, PAGE_SIZE, searchProducts } from "@/services/catalog";

type SearchParams = Promise<{ category?: string; page?: string; q?: string }>;

const pageNumber = (value?: string) => Math.max(1, Number.parseInt(value ?? "1", 10) || 1);

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category, q } = await searchParams;
  // Results pages stay out of the index: endless near-copies of the listing
  if (q?.trim()) return createMetadata({ title: `Search: ${q.trim()}`, path: "/shop", noIndex: true });
  if (!category) return createPageMetadata("/shop");
  const result = await getCategoryProducts(category);
  if (!result) return createPageMetadata("/shop");
  const meta = result.category.meta;
  return createMetadata({
    title: meta?.title || result.category.name,
    description: meta?.description || result.category.description || undefined,
    path: `/shop?category=${category}`,
  });
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const { category: categoryParam, page: pageParam, q } = await searchParams;
  const page = pageNumber(pageParam);
  // A search runs across the whole catalogue, so it sets any category aside
  const search = q?.trim() ?? "";
  const category = search ? undefined : categoryParam;

  const [categories, listing] = await Promise.all([
    getCategories(),
    search ? searchProducts(search, page) : category ? getCategoryProducts(category, page) : getProducts({ page }),
  ]);

  const products = listing?.products ?? [];
  const totalPages = Math.ceil((listing?.totalCount ?? 0) / PAGE_SIZE);
  const activeCategory = listing && "category" in listing ? listing.category : null;
  const title = search ? `Results for “${search}”` : (activeCategory?.name ?? "Shop all");
  // The hero (and its h1) on the plain listing; filtered, searched and later pages go straight to the products
  const showHero = !category && !search && page === 1;

  const query = (p: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    // Fades in over the skeleton as it leaves (loading.tsx) when the listing streams in
    <ViewTransition enter="page-in" default="none">
      {showHero && <ShopHero />}
      <section aria-label={title}>
        <JsonLd data={productListSchema(products, title, query(page))} />
        {showHero ? (
          // Section spacing below the banner, framed so the rails run down into the grid's frame;
          // the hero holds the h1, the listing still gets a heading for the outline
          <Frame className="pt-section">
            <h2 className="sr-only">{title}</h2>
          </Frame>
        ) : (
          // Framed, so the rails run on unbroken into the grid's frame below
          <Frame className="flex flex-col gap-6 px-inset pt-section pb-stack">
            <Breadcrumbs
              items={
                activeCategory || search
                  ? [
                      { name: "Shop", path: "/shop" },
                      { name: activeCategory?.name ?? "Search", path: query(1) },
                    ]
                  : [{ name: "Shop", path: "/shop" }]
              }
            />
            <PageHeader title={title} description={activeCategory?.description ?? undefined} />
          </Frame>
        )}
        <ShopProducts
          categories={categories}
          products={products}
          activeCategory={category ?? ""}
          search={search}
          page={page}
          totalPages={totalPages}
          href={query}
        />
      </section>
    </ViewTransition>
  );
}
