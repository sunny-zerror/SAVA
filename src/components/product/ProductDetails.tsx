import { RiHandHeartLine, RiStarFill, RiStarHalfLine, RiStarLine, RiUserHeartLine } from "@remixicon/react";
import ProductPurchase from "@/components/product/ProductPurchase";
import FaqAccordion from "@/components/sections/home/FaqAccordion";
import type { ProductContent, ProductHighlight } from "@/data/product-content";
import type { Product } from "@/types";

const highlightIcons: Record<ProductHighlight["icon"], typeof RiUserHeartLine> = {
  skin: RiUserHeartLine,
  apply: RiHandHeartLine,
};

interface ProductDetailsProps {
  product: Product;
  /** Tagline, rating and highlight rows — left out when the product has none */
  content?: ProductContent;
}

/**
 * The column beside the gallery: the name, pickers and buttons (ProductPurchase), the at-a-glance
 * rows, then the product's details from z-commerce (additionalInfo) as an accordion, the first open.
 */
export default function ProductDetails({ product, content }: ProductDetailsProps) {
  const info = (product.additionalInfo ?? []).filter((item) => item.title && item.description);

  return (
    <div className="flex flex-col">
      <ProductPurchase
        product={product}
        title={
          <h1 data-heading-effect className="text-h3">
            {product.name}
          </h1>
        }
      >
        {content && (
          <>
            <p className="text-body text-muted">{content.tagline}</p>
            <Rating {...content.rating} />
          </>
        )}
      </ProductPurchase>

      {content && content.highlights.length > 0 && (
        <dl data-reveal="stagger" className="mt-8 flex flex-col gap-4 border-t border-line pt-6">
          {content.highlights.map(({ icon, label, value }) => {
            const Icon = highlightIcons[icon];
            return (
              <div key={label} className="grid grid-cols-[1.25rem_7rem_1fr] items-center gap-3 text-caption">
                <Icon aria-hidden="true" className="size-5 text-accent" />
                <dt className="font-medium">{label}</dt>
                <dd className="text-muted">{value}</dd>
              </div>
            );
          })}
        </dl>
      )}

      {info.length > 0 && (
        <div data-reveal className="mt-6">
          <FaqAccordion exclusive={false} className="flex flex-col border-t border-line">
            {info.map((item, i) => (
              // expanded: / group-expanded: (not open:) so the styles change as the item animates
              <details key={item.title} open={i === 0} className="group overflow-hidden border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
                  <h2 className="text-h6 transition-colors duration-500 group-expanded:text-accent">{item.title}</h2>
                  {/* A plus whose upright turns flat into a minus */}
                  <span
                    aria-hidden="true"
                    className="relative center size-4 shrink-0 transition-colors duration-500 group-expanded:text-accent"
                  >
                    <span className="absolute h-px w-3 bg-current" />
                    <span className="absolute h-3 w-px bg-current transition-transform duration-500 ease-out-expo group-expanded:rotate-90" />
                  </span>
                </summary>
                {/* z-commerce stores rich text here; shown as text unless the HTML is trusted and sanitised */}
                <p data-accordion-content className="pb-5 text-caption whitespace-pre-line text-muted">
                  {item.description.replace(/<[^>]+>/g, "")}
                </p>
              </details>
            ))}
          </FaqAccordion>
        </div>
      )}
    </div>
  );
}

function Rating({ score, count }: ProductContent["rating"]) {
  return (
    <p className="flex items-center gap-2 text-caption text-muted">
      <span role="img" aria-label={`Rated ${score} out of 5`} className="flex gap-0.5 text-star">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = score - i;
          const Star = filled >= 0.75 ? RiStarFill : filled >= 0.25 ? RiStarHalfLine : RiStarLine;
          return <Star key={i} aria-hidden="true" className="size-3.5" />;
        })}
      </span>
      <span className="tabular-nums">
        {score.toFixed(1)} ({count.toLocaleString("en-IN")})
      </span>
    </p>
  );
}
