/*
 * schema.org structured data (JSON-LD) for rich results. Render with <JsonLd />.
 */
import { siteConfig } from "@/config/site";
import type { BlogPost } from "@/data/blog-posts";
import type { Crumb, Product, ProductSummary } from "@/types";
import { mediaUrl, productImages } from "@/utils/media";
import { displayPrice, isSoldOut } from "@/utils/product";
import { absoluteUrl, blogHref, productHref } from "@/utils/url";

const ORG_ID = absoluteUrl("/#organization");
const SITE_ID = absoluteUrl("/#website");

export const organizationSchema = () => {
  const sameAs = Object.values(siteConfig.socials).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    "@id": ORG_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: absoluteUrl("/"),
    logo: absoluteUrl(siteConfig.logo),
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    ...(siteConfig.contact.phone ? { telephone: siteConfig.contact.phone } : {}),
    ...(siteConfig.address.city
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: siteConfig.address.street,
            addressLocality: siteConfig.address.city,
            addressRegion: siteConfig.address.state,
            postalCode: siteConfig.address.postalCode,
            addressCountry: siteConfig.address.country,
          },
        }
      : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
};

export const websiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": SITE_ID,
  name: siteConfig.name,
  url: absoluteUrl("/"),
  inLanguage: siteConfig.language,
  publisher: { "@id": ORG_ID },
});

export const breadcrumbSchema = (crumbs: Crumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...crumbs].map((c, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: c.name,
    item: absoluteUrl(c.path),
  })),
});

// No aggregateRating: the product page's scores are placeholder copy (src/data/product-content.ts)
export const productSchema = (product: Product) => {
  const { price } = displayPrice(product);
  const url = absoluteUrl(productHref(product.slug));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.meta?.description || product.description || undefined,
    sku: product.variants?.[0]?.sku || product._id,
    url,
    image: productImages(product.assets).map((a) => absoluteUrl(mediaUrl(a.path))),
    brand: { "@type": "Brand", name: siteConfig.name },
    ...(product.categories?.[0] ? { category: product.categories[0].name } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: siteConfig.currency,
      price: price.toFixed(2),
      availability: isSoldOut(product) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": ORG_ID },
    },
  };
};

export const productListSchema = (products: ProductSummary[], name: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name,
  url: absoluteUrl(path),
  isPartOf: { "@id": SITE_ID },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(productHref(p.slug)),
      name: p.name,
    })),
  },
});

export const blogListSchema = (posts: BlogPost[], name: string, path: string) => ({
  "@context": "https://schema.org",
  "@type": "Blog",
  name,
  url: absoluteUrl(path),
  isPartOf: { "@id": SITE_ID },
  publisher: { "@id": ORG_ID },
  blogPost: posts.map((p) => ({
    "@type": "BlogPosting",
    headline: p.title,
    url: absoluteUrl(blogHref(p.slug)),
    datePublished: p.date,
  })),
});

export const articleSchema = (post: BlogPost, section: string) => {
  const url = absoluteUrl(blogHref(post.slug));
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.excerpt,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(post.image.src),
    datePublished: post.date,
    dateModified: post.date,
    articleSection: section,
    inLanguage: siteConfig.language,
    author: { "@type": "Person", name: post.author },
    publisher: { "@id": ORG_ID },
    isPartOf: { "@id": SITE_ID },
  };
};
