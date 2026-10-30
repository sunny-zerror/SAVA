import { cn } from "@/utils/cn";

/** Shimmering placeholder block — give it a size and a radius (rounded-full for text lines, rounded-3xl for cards) */
export default function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("skeleton block", className)} />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-2 gap-grid md:grid-cols-3 lg:grid-cols-4"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="flex flex-col items-center gap-3">
          <Skeleton className="aspect-4/5 w-full rounded-3xl" />
          <Skeleton className="h-4 w-2/3 rounded-full" />
          <Skeleton className="h-4 w-1/3 rounded-full" />
        </div>
      ))}
    </div>
  );
}
