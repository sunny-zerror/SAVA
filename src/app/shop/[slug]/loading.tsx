import { ViewTransition } from "react";
import ProductSkeleton from "@/components/product/ProductSkeleton";

/*
 * Safe beside notFound(): the page sets dynamicParams = false, so a slug that isn't a product gets
 * its 404 from the router before this streams (see "Real 404s" in CLAUDE.md).
 */
export default function Loading() {
  // Fades out as the product arrives (page.tsx fades it in) — a Suspense reveal, not a route change
  return (
    <ViewTransition exit="page-out" default="none">
      <ProductSkeleton />
    </ViewTransition>
  );
}
