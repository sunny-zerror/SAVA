import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import ProductGrid from "@/components/product/ProductGrid";
import ProductPurchase from "@/components/product/ProductPurchase";
import JsonLd from "@/components/seo/JsonLd";
import Accordion from "@/components/ui/Accordion";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { productSchema } from "@/lib/schema";
import { createMetadata } from "@/lib/seo";
import { getProduct, getRelatedProducts } from "@/services/catalog";
import { primaryImage } from "@/utils/media";
import { productHref } from "@/utils/url";

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  // Thrown here too: metadata resolves before streaming starts for crawlers, so they get a real 404
  if (!product) notFound();

  const image = product.meta?.og?.image || primaryImage(product.assets)?.path;
  const keywords = product.meta?.keywords;
  return createMetadata({
    title: product.meta?.title || product.name,
    description: product.meta?.description || product.description?.slice(0, 160) || undefined,
    path: productHref(product.slug),
    image: image || undefined,
    imageAlt: product.name,
    keywords: Array.isArray(keywords) ? keywords : keywords ? keywords.split(",").map((k) => k.trim()) : undefined,
  });
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const category = product.categories?.[0];
  const details = [
    ...(product.description
      ? [{ title: "Description", content: <p className="whitespace-pre-line">{product.description}</p> }]
      : []),
    ...(product.additionalInfo ?? []).map((info) => ({
      title: info.title,
      // z-commerce stores rich text here; render as text unless you trust and sanitise the HTML
      content: <p className="whitespace-pre-line">{info.description.replace(/<[^>]+>/g, "")}</p>,
    })),
  ];

  return (
    <>
      <JsonLd data={productSchema(product)} />
      <section className="container pt-6 pb-section">
        <Breadcrumbs
          items={[
            { name: "Shop", path: "/shop" },
            ...(category ? [{ name: category.name, path: `/shop?category=${category.slug}` }] : []),
            { name: product.name, path: productHref(product.slug) },
          ]}
        />
        <div className="mt-6 grid gap-stack md:grid-cols-[3fr_2fr]">
          <ProductGallery assets={product.assets} name={product.name} />
          <div className="flex flex-col gap-8 md:sticky md:top-[calc(var(--spacing-header)+1.5rem)] md:self-start">
            <header className="flex flex-col gap-3">
              {product.ribbon?.name && <p className="text-eyebrow text-accent">{product.ribbon.name}</p>}
              <h1 data-heading-effect className="text-4xl md:text-5xl">
                {product.name}
              </h1>
            </header>
            <ProductPurchase product={product} />
            {details.length > 0 && <Accordion items={details} />}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section container border-t border-line" aria-labelledby="related">
          <h2 id="related" className="mb-stack">
            You may also like
          </h2>
          <ProductGrid products={related} priorityCount={0} />
        </section>
      )}
    </>
  );
}
