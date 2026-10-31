"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import ShopSkeleton from "@/components/sections/shop/ShopSkeleton";

// Mirrors the page: the hero only on the unfiltered first page
function ListingSkeleton() {
  const params = useSearchParams();
  const hero = !params.get("category") && (Number.parseInt(params.get("page") ?? "1", 10) || 1) <= 1;
  return <ShopSkeleton hero={hero} />;
}

export default function Loading() {
  // Fades out as the listing arrives (page.tsx fades it in) — a Suspense reveal, not a route change.
  // useSearchParams needs its own boundary so the shell can prerender; it falls back to plain /shop.
  return (
    <ViewTransition exit="page-out" default="none">
      <Suspense fallback={<ShopSkeleton hero />}>
        <ListingSkeleton />
      </Suspense>
    </ViewTransition>
  );
}
