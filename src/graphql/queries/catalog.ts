import { gql, type TypedDocumentNode } from "@apollo/client";
import { ASSET, PRODUCT_CARD, SEO_META, VARIANT } from "@/graphql/fields";
import type { Category, Product, ProductSummary } from "@/types";

type ListVars = { limit?: number; offset?: number; filters?: Record<string, unknown> };

export const GET_PRODUCTS: TypedDocumentNode<
  { getClientSideProducts: { products: ProductSummary[]; totalCount: number } },
  ListVars
> = gql`
  query GetClientSideProducts($limit: Int, $offset: Int, $filters: GetProductsFilterInput) {
    getClientSideProducts(limit: $limit, offset: $offset, filters: $filters) {
      products { ${PRODUCT_CARD} }
      totalCount
    }
  }
`;

export const GET_PRODUCT: TypedDocumentNode<{ getClientSideProductById: Product | null }, { slug: string }> = gql`
  query GetClientSideProductById($slug: String) {
    getClientSideProductById(slug: $slug) {
      _id name slug description price discountedPrice status categoryIds
      additionalInfo { title description }
      categories { _id name slug }
      assets { _id ${ASSET} isSizeGuide }
      productOptions { optionName choices { name assetsId } showInProductPageAs }
      variants { ${VARIANT} }
      ribbon { name ribbonId }
      meta { ${SEO_META} }
    }
  }
`;

export const GET_FILTER_OPTIONS: TypedDocumentNode<
  { getFilterOptions: { minPrice: number; maxPrice: number; attributes: { key: string; values: string[] }[] } },
  { categoryIds?: string[] }
> = gql`
  query GetFilterOptions($categoryIds: [ID]) {
    getFilterOptions(categoryIds: $categoryIds) {
      minPrice
      maxPrice
      attributes {
        key
        values
      }
    }
  }
`;

export const GET_CATEGORIES: TypedDocumentNode<
  { getClientSideCategories: { categories: Category[]; totalCount: number } },
  { limit?: number; offset?: number; filter?: Record<string, unknown> }
> = gql`
  query GetClientSideCategories($offset: Int, $limit: Int, $filter: CategoriesFilterInput) {
    getClientSideCategories(offset: $offset, limit: $limit, filter: $filter) {
      categories {
        _id
        name
        slug
        imgsrc
      }
      totalCount
    }
  }
`;

export const GET_CATEGORY: TypedDocumentNode<
  { getClientSideCategory: (Category & { products: ProductSummary[]; productsCount: number }) | null },
  { slug: string; limit?: number; offset?: number }
> = gql`
  query GetClientSideCategory($slug: String, $limit: Int, $offset: Int) {
    getClientSideCategory(slug: $slug) {
      _id name slug description imgsrc
      meta { ${SEO_META} }
      products(limit: $limit, offset: $offset) { ${PRODUCT_CARD} }
      productsCount
    }
  }
`;
