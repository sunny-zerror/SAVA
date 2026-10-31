"use client";

import { useSearchParams } from "next/navigation";
import { ViewTransition } from "react";
import ShopSkeleton from "@/components/sections/shop/ShopSkeleton";

export default function Loading() {
  // Mirrors the page: the hero only on the unfiltered first page
  const params = useSearchParams();
  const hero = !params.get("category") && (Number.parseInt(params.get("page") ?? "1", 10) || 1) <= 1;

  // Fades out as the listing arrives (page.tsx fades it in) — a Suspense reveal, not a route change
  return (
    <ViewTransition exit="page-out" default="none">
      <ShopSkeleton hero={hero} />
    </ViewTransition>
  );
}
