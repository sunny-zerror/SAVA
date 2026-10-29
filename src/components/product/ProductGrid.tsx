import ProductCard from "@/components/product/ProductCard";
import type { ProductSummary } from "@/types";

export default function ProductGrid({
  products,
  priorityCount = 4,
}: {
  products: ProductSummary[];
  priorityCount?: number;
}) {
  if (products.length === 0) {
    return <p className="py-section text-center text-body text-muted">No products here yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-grid gap-y-stack md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product._id} product={product} priority={i < priorityCount} />
      ))}
    </div>
  );
}
