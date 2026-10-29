import type { Metadata } from "next";
import Link from "next/link";
import ProductGrid from "@/components/product/ProductGrid";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import PageHeader from "@/components/ui/PageHeader";
import Pagination from "@/components/ui/Pagination";
import { productListSchema } from "@/lib/schema";
import { createMetadata, createPageMetadata } from "@/lib/seo";
import { getCategories, getCategoryProducts, getProducts, PAGE_SIZE } from "@/services/catalog";
import { cn } from "@/utils/cn";

type SearchParams = Promise<{ category?: string; page?: string }>;

const pageNumber = (value?: string) => Math.max(1, Number.parseInt(value ?? "1", 10) || 1);

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const { category } = await searchParams;
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
  const { category, page: pageParam } = await searchParams;
  const page = pageNumber(pageParam);

  const [categories, listing] = await Promise.all([
    getCategories(),
    category ? getCategoryProducts(category, page) : getProducts({ page }),
  ]);

  const products = listing?.products ?? [];
  const totalPages = Math.ceil((listing?.totalCount ?? 0) / PAGE_SIZE);
  const activeCategory = listing && "category" in listing ? listing.category : null;
  const title = activeCategory?.name ?? "Shop all";

  const query = (p: number) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  return (
    <section className="section container flex flex-col gap-stack">
      <JsonLd data={productListSchema(products, title, query(page))} />
      <div className="flex flex-col gap-6">
        <Breadcrumbs
          items={
            activeCategory
              ? [
                  { name: "Shop", path: "/shop" },
                  { name: activeCategory.name, path: query(1) },
                ]
              : [{ name: "Shop", path: "/shop" }]
          }
        />
        <PageHeader title={title} description={activeCategory?.description ?? undefined} />
      </div>

      {categories.length > 0 && (
        <nav aria-label="Categories" className="-mx-gutter no-scrollbar overflow-x-auto px-gutter">
          <ul className="flex gap-2">
            {[{ slug: "", name: "All" }, ...categories].map((c) => {
              const active = (category ?? "") === c.slug;
              return (
                <li key={c.slug || "all"}>
                  <Link
                    href={c.slug ? `/shop?category=${c.slug}` : "/shop"}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "block border px-4 py-2 text-caption whitespace-nowrap transition-colors",
                      active ? "border-ink bg-ink text-paper" : "border-line hover:border-ink",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <ProductGrid products={products} />
      <Pagination page={page} totalPages={totalPages} href={query} />
    </section>
  );
}
