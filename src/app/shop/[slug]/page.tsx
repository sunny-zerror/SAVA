import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import ProductDetails from "@/components/product/ProductDetails";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfoTabs from "@/components/product/ProductInfoTabs";
import ProductStory from "@/components/product/ProductStory";
import RelatedProducts from "@/components/product/RelatedProducts";
import JsonLd from "@/components/seo/JsonLd";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Frame, FrameRule } from "@/components/ui/Frame";
import { productContent } from "@/data/product-content";
import { productSchema } from "@/lib/schema";
import { createMetadata } from "@/lib/seo";
import { getProduct, getProducts, getRelatedProducts } from "@/services/catalog";
import { primaryImage } from "@/utils/media";
import { productHref } from "@/utils/url";

type Params = Promise<{ slug: string }>;

// Every product is built as a static page — from the demo catalogue until z-commerce is connected,
// then from the store's products. Only those slugs exist: any other gets its 404 from the router,
// before loading.tsx can stream (a product added to the store later needs a rebuild to get a page).
export const dynamicParams = false;

export async function generateStaticParams() {
  const { products } = await getProducts({ limit: 1000 });
  return products.map((p) => ({ slug: p.slug }));
}

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

  const content = productContent[product.slug];
  const related = await getRelatedProducts(product);

  return (
    // Fades in over the skeleton as it leaves (loading.tsx)
    <ViewTransition enter="page-in" default="none">
      {/* data-reveal-sequence: the opening plays in page order, a step apart — breadcrumbs, photo,
          thumbnails, name, sizes, tagline, price, packs and buttons, highlights, accordion */}
      <section aria-label={product.name} data-reveal-sequence>
        <JsonLd data={productSchema(product)} />
        {/* No space after the closing rule: the sections below run on from it, one rule between each */}
        <Frame>
          <div data-reveal className="px-inset pt-8 pb-6">
            <Breadcrumbs
              items={[
                { name: "Shop", path: "/shop" },
                { name: product.name, path: productHref(product.slug) },
              ]}
            />
          </div>
          <FrameRule />
          <div className="grid gap-stack px-inset py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16 lg:py-14">
            {/* The photos ride down beside the details while they scroll */}
            <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)] lg:self-start">
              <ProductGallery assets={product.assets} name={product.name} ribbon={product.ribbon?.name} />
            </div>
            <ProductDetails product={product} content={content} />
          </div>
          <FrameRule />
        </Frame>
      </section>

      <ProductStory />
      <ProductInfoTabs product={product} content={content} />
      {related.length > 0 && <RelatedProducts products={related} />}
    </ViewTransition>
  );
}
