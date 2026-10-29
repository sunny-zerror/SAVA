import Skeleton, { ProductGridSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <section className="section container flex flex-col gap-stack">
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-14 w-64" />
      </div>
      <ProductGridSkeleton />
    </section>
  );
}
