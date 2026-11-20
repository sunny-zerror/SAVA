import { RiStarFill } from "@remixicon/react";
import { productContent } from "@/data/product-content";
import type { SavaStickVariant } from "@/lib/sava-stick";
import { getProduct } from "@/services/catalog";
import { cardVariant, displayPrice, isSoldOut } from "@/utils/product";
import { experienceMedia } from "./media";
import RangePicker, { type RangeOption } from "./RangePicker";

const RANGES: { slug: string; variant: SavaStickVariant; name: string; finish: string }[] = [
  { slug: "sava-balanced", variant: "balanced", name: "Balanced", finish: "Matte blue" },
  { slug: "sava-kinetic", variant: "kinetic", name: "Kinetic", finish: "Brushed silver" },
  { slug: "sava-renewed", variant: "renewed", name: "Renewed", finish: "Forest green" },
  { slug: "sava-grounded", variant: "grounded", name: "Grounded", finish: "Dark chocolate" },
];

/**
 * The range, after the Oryzo "choose your own" picker: pick a scent and the stick spins round into
 * it (RangePicker), with its price and Add to cart from the catalogue; then the four side by side.
 */
export default async function ExperienceRange() {
  const products = await Promise.all(RANGES.map(({ slug }) => getProduct(slug)));

  const ranges: RangeOption[] = RANGES.map((range, i) => {
    const product = products[i];
    const content = productContent[range.slug];
    const { price, compareAt } = product ? displayPrice(product) : { price: 0, compareAt: null };
    return {
      ...range,
      scent: content?.scent ?? "",
      tagline: content?.tagline ?? "",
      rating: content?.rating ?? null,
      image: experienceMedia.scent[range.variant],
      buy: product
        ? {
            productId: product._id,
            categoryId: product.categoryIds?.[0] ?? undefined,
            selectedOptions: cardVariant(product)?.selectedOptions ?? [],
            soldOut: isSoldOut(product),
            price,
            compareAt,
          }
        : null,
    };
  });

  const rows: [string, (range: RangeOption) => React.ReactNode][] = [
    ["Scent", (range) => range.scent],
    ["Finish", (range) => range.finish],
    ["Character", (range) => range.tagline.replace(/^Sweat control\.\s*/, "")],
    [
      "Rating",
      (range) =>
        range.rating && (
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <RiStarFill className="size-3.5 text-star" aria-hidden="true" />
            {range.rating.score.toFixed(1)}
          </span>
        ),
    ],
    ["Format", () => "50 ml twist-up stick"],
    ["Protection", () => "Dual-action sweat and odour defence"],
  ];

  return (
    <section id="range" aria-labelledby="experience-range" data-chapter="Range" className="relative">
      {/* Holds the stick out of sight until here, then it grows into the picker */}
      <div
        aria-hidden="true"
        data-stick="range-enter"
        data-stick-fit="0"
        data-stick-turn="5"
        className="absolute top-0 left-1/2 aspect-1122/1402 h-[30svh] -translate-x-1/2"
      />

      <RangePicker ranges={ranges} />

      <div className="section container">
        <h3 data-reveal className="text-h4">
          Compare the range
        </h3>
        <div data-reveal className="mt-8 overflow-x-auto">
          <table className="w-full min-w-xl border-collapse text-left">
            <thead>
              <tr className="border-b border-rule">
                <td className="py-4" />
                {ranges.map((range) => (
                  <th key={range.slug} scope="col" className="py-4 pr-4 text-kicker">
                    {range.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, cell]) => (
                <tr key={label} className="border-b border-line">
                  <th scope="row" className="py-4 pr-4 text-eyebrow text-muted">
                    {label}
                  </th>
                  {ranges.map((range) => (
                    <td key={range.slug} className="py-4 pr-4">
                      {cell(range)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
