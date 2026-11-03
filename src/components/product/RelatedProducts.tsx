import ProductCarousel from "@/components/product/ProductCarousel";
import ShopProductCard from "@/components/product/ShopProductCard";
import { Frame } from "@/components/ui/Frame";
import { isApiConfigured } from "@/lib/env";
import type { ProductSummary } from "@/types";

/** Demo: the catalogue has three products related to any one, so they're shown twice to give the carousel room to move */
const DEMO_ROUNDS = 2;

/** The product page's foot: other products from its range, as shop cards in a carousel */
export default function RelatedProducts({ products }: { products: ProductSummary[] }) {
  const rounds = isApiConfigured ? 1 : DEMO_ROUNDS;
  const cards = Array.from({ length: rounds }, (_, round) =>
    products.map((product) => ({ product, key: `${product._id}-${round}` })),
  ).flat();

  return (
    // data-reveal-replay: its entrances play on the way down and reverse on the way back up
    <section aria-labelledby="related-products" data-reveal-replay>
      <Frame className="pb-section">
        <ProductCarousel
          label="Related products"
          title={
            <h2 id="related-products" data-heading-effect className="max-w-md">
              Featured Related Product
            </h2>
          }
        >
          {cards.map(({ product, key }) => (
            <ShopProductCard key={key} product={product} />
          ))}
        </ProductCarousel>
      </Frame>
    </section>
  );
}
