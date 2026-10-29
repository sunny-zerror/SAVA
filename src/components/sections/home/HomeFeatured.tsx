import ProductGrid from "@/components/product/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { getProducts } from "@/services/catalog";

export default async function HomeFeatured() {
  const { products } = await getProducts({ limit: 8 });

  return (
    <section className="section container" aria-labelledby="home-featured">
      <div className="mb-stack flex items-end justify-between gap-6">
        <div>
          <p className="mb-3 text-eyebrow text-muted">Just in</p>
          <h2 id="home-featured">New arrivals</h2>
        </div>
        <ButtonLink href="/shop" variant="ghost">
          View all
        </ButtonLink>
      </div>
      <ProductGrid products={products} priorityCount={0} />
    </section>
  );
}
