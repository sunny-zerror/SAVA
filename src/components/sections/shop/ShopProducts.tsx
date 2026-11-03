import ShopFilters from "@/components/product/ShopFilters";
import ShopProductCard from "@/components/product/ShopProductCard";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Pagination from "@/components/ui/Pagination";
import type { Category, ProductSummary } from "@/types";

interface ShopProductsProps {
  categories: Category[];
  products: ProductSummary[];
  /** Slug of the active category ("" for all) */
  activeCategory: string;
  page: number;
  totalPages: number;
  href: (page: number) => string;
}

/** Demo: the catalogue has four products, so the grid shows them this many times over (12 fill rows of 2 and 3) */
const DEMO_REPEAT = 3;

/**
 * The shop listing, framed between the page rails: the filter sidebar on the left (sticky under the
 * header while the products scroll), the products in a ruled grid (one hairline between cells) on
 * the right, pagination underneath.
 */
export default function ShopProducts({
  categories,
  products,
  activeCategory,
  page,
  totalPages,
  href,
}: ShopProductsProps) {
  const cards = Array.from({ length: DEMO_REPEAT }, (_, round) =>
    products.map((product) => ({ product, key: `${product._id}-${round}` })),
  ).flat();

  return (
    // The section's bottom space sits inside the frame, so the rails run on down to the footer
    <Frame className="pb-section">
      <FrameRule />
      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,3.3fr)]">
        <div className="px-inset py-8 max-lg:border-b max-lg:border-line lg:border-r lg:border-line">
          {/* The column runs the grid's full height (for its rule); the filters ride down it */}
          <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]">
            <ShopFilters categories={categories} active={activeCategory} />
          </div>
        </div>

        <div className="flex flex-col">
          {products.length === 0 ? (
            <p className="py-section text-center text-body text-muted">No products here yet.</p>
          ) : (
            // gap-px over a line-coloured ground: hairlines between the cells. The cards rise in turn
            <div data-reveal="stagger" className="grid grid-cols-2 gap-px bg-line md:grid-cols-3">
              {cards.map(({ product, key }, i) => (
                <ShopProductCard key={key} product={product} priority={i < 3} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="border-t border-line px-inset py-8">
              <Pagination page={page} totalPages={totalPages} href={href} />
            </div>
          )}
        </div>
      </div>
      <FrameRule />
    </Frame>
  );
}
