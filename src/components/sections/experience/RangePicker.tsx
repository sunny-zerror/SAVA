"use client";

import { RiStarFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import AddToCartButton from "@/components/product/AddToCartButton";
import Price from "@/components/ui/Price";
import type { SavaStickVariant } from "@/lib/sava-stick";
import { cn } from "@/utils/cn";
import { productHref } from "@/utils/url";
import { experienceMedia } from "./media";

export interface RangeOption {
  slug: string;
  variant: SavaStickVariant;
  name: string;
  finish: string;
  scent: string;
  tagline: string;
  rating: { score: number; count: number } | null;
  /** The scent's still life */
  image: string;
  /** Null when the catalogue doesn't have it: the panel links to the shop instead */
  buy: {
    productId: string;
    categoryId?: string;
    selectedOptions: string[];
    soldOut: boolean;
    price: number;
    compareAt: number | null;
  } | null;
}

const swatch: Record<SavaStickVariant, string> = {
  balanced: "bg-balanced",
  kinetic: "bg-kinetic",
  renewed: "bg-renewed",
  grounded: "bg-grounded",
};

// Every range's pieces sit stacked in one grid cell; the chosen one fades up
const stack = "col-start-1 row-start-1 transition-opacity duration-500";

/**
 * The scent picker: a tab per range. The 3D stick (ExperienceStage) spins round into the chosen one —
 * its slot carries the choice as data-stick-variant — and the section takes on a tint of its finish.
 */
export default function RangePicker({ ranges }: { ranges: RangeOption[] }) {
  const [active, setActive] = useState(0);
  const range = ranges[active];

  return (
    <div
      className="py-section transition-colors duration-700"
      style={{ backgroundColor: `color-mix(in srgb, var(--color-${range.variant}) 16%, var(--color-paper))` }}
    >
      <div className="container">
        <div data-reveal-replay className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-reveal className="text-kicker text-accent">
              The range
            </p>
            <h2 id="experience-range" data-heading-effect className="mt-3">
              Choose your scent.
            </h2>
          </div>
          <div data-reveal role="tablist" aria-label="Ranges" className="flex flex-wrap gap-2">
            {ranges.map((option, i) => (
              <button
                key={option.slug}
                type="button"
                role="tab"
                id={`range-tab-${option.variant}`}
                aria-selected={i === active}
                aria-controls="range-panel"
                onClick={() => setActive(i)}
                className={cn(
                  "flex h-11 items-center gap-2.5 rounded-full border px-5 text-cta transition-colors duration-300",
                  i === active ? "border-ink bg-ink text-paper" : "border-ink/20 hover:border-ink",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn("size-3 rounded-full ring-1 ring-paper/60", swatch[option.variant])}
                />
                {option.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-stack grid items-center gap-stack md:grid-cols-2">
          {/* The stick, on a soft disc; drag to turn it */}
          <div className="relative mx-auto aspect-square w-full max-w-xl">
            <div aria-hidden="true" className="absolute inset-[8%] rounded-full bg-paper/70" />
            <div
              data-stick="range"
              data-stick-variant={range.variant}
              data-stick-idle="0.35"
              data-stick-drag
              className="pointer-events-none absolute top-1/2 left-1/2 aspect-1122/1402 h-[78%] -translate-1/2 touch-pan-y model-ready:pointer-events-auto model-ready:cursor-grab model-ready:active:cursor-grabbing"
            >
              <div className="grid size-full">
                {ranges.map((option, i) => (
                  <div
                    key={option.slug}
                    className={cn(stack, "relative model-ready:invisible", i === active ? "opacity-100" : "opacity-0")}
                  >
                    {/* Packshots on white: multiplied, the white drops out against the tint */}
                    <Image
                      src={experienceMedia.packshot[option.variant]}
                      alt=""
                      fill
                      sizes="24rem"
                      className="object-cover mix-blend-multiply"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div id="range-panel" role="tabpanel" aria-labelledby={`range-tab-${range.variant}`} className="grid">
            {ranges.map((option, i) => (
              <div
                key={option.slug}
                aria-hidden={i !== active}
                className={cn(stack, i === active ? "opacity-100" : "pointer-events-none opacity-0")}
              >
                <div className="relative aspect-video overflow-hidden rounded-lg bg-surface">
                  <Image
                    src={option.image}
                    alt={`${option.scent}: the scent of SAVA ${option.name}`}
                    fill
                    sizes="(min-width: 48rem) 45vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-8 text-kicker text-muted">
                  {String(i + 1).padStart(2, "0")} — {option.finish}
                </p>
                <h3 className="mt-3 text-h2">SAVA {option.name}</h3>
                <p className="mt-2 text-h5 text-accent">{option.scent}</p>
                <p className="mt-4 text-lead">{option.tagline}</p>
                {option.rating && (
                  <p className="mt-4 flex items-center gap-2 text-caption text-muted tabular-nums">
                    <RiStarFill className="size-4 text-star" aria-hidden="true" />
                    {option.rating.score.toFixed(1)} · {option.rating.count} reviews
                  </p>
                )}
                <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
                  {option.buy ? (
                    <>
                      <Price price={option.buy.price} compareAt={option.buy.compareAt} className="text-h4" />
                      {/* The button spans its container: this sets its width */}
                      <div className="w-64">
                        <AddToCartButton
                          slug={option.slug}
                          productId={option.buy.productId}
                          categoryId={option.buy.categoryId}
                          selectedOptions={option.buy.selectedOptions}
                          soldOut={option.buy.soldOut}
                        />
                      </div>
                      <Link href={productHref(option.slug)} className="link-underline text-cta">
                        View details
                      </Link>
                    </>
                  ) : (
                    <Link href="/shop" className="link-underline text-cta">
                      Shop the range
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
