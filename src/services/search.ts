/*
 * The site search behind the header's search drawer (/api/search): products, through the shop's own
 * search (searchProducts), and Sweat School posts. Results are trimmed to what the drawer's rows show.
 */
import { searchConfig } from "@/config/shop";
import { productContent } from "@/data/product-content";
import type { BlogPost } from "@/data/blog-posts";
import { getBlogCategory, getBlogPosts } from "@/services/blog";
import { searchProducts } from "@/services/catalog";
import type { ProductSummary, SearchPost, SearchProduct, SearchResults } from "@/types";
import { mediaUrl, primaryImage } from "@/utils/media";
import { cardVariant, displayPrice } from "@/utils/product";

const PRODUCT_LIMIT = 4;
const POST_LIMIT = 3;

/** A product as the drawer lists it, priced like the listing card: the variant it sells, or its sale price */
export function toSearchProduct(product: ProductSummary): SearchProduct {
  const variant = cardVariant(product);
  const listed = variant?.variantPrice || displayPrice(product).price;
  const sale = product.discountedPrice && product.discountedPrice < listed ? product.discountedPrice : null;
  return {
    slug: product.slug,
    name: product.name,
    scent: productContent[product.slug]?.scent,
    image: mediaUrl(primaryImage(product.assets)?.path),
    price: sale ?? listed,
    compareAt: sale ? listed : null,
  };
}

export const toSearchPost = (post: BlogPost): SearchPost => ({
  slug: post.slug,
  title: post.title,
  category: getBlogCategory(post.category)?.name ?? "",
  date: post.date,
  image: { src: post.image.src, alt: post.image.alt, position: post.image.position },
});

export async function siteSearch(term: string): Promise<SearchResults> {
  if (term.length < searchConfig.minLength) return { products: [], productCount: 0, posts: [], postCount: 0 };
  const { products, totalCount } = await searchProducts(term);
  const blog = getBlogPosts({ search: term });
  return {
    products: products.slice(0, PRODUCT_LIMIT).map(toSearchProduct),
    productCount: totalCount,
    posts: blog.posts.slice(0, POST_LIMIT).map(toSearchPost),
    postCount: blog.totalCount,
  };
}
