import { RiHeart3Fill, RiHeart3Line, RiPlayFill, RiStarFill } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import BlobButton from "@/components/ui/BlobButton";
import { Frame, FrameRule } from "@/components/ui/Frame";
import SectionHeading from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";
import { getProduct } from "@/services/catalog";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";
import { displayPrice } from "@/utils/product";
import { productHref } from "@/utils/url";
import RatingMotion from "./RatingMotion";
import ReviewsMotion from "./ReviewsMotion";
import ReviewsCanvas from "./ReviewsCanvas";
import StickThumb from "./StickThumb";

const summary = {
  rating: 4.8,
  count: 1315,
  // Share of reviews at 5, 4, 3 and 2 stars
  breakdown: [75, 40, 25, 12],
};

// Placement on the scattered desktop grid: one block of three — portrait beside the summary,
// landscape under it, portrait lower right — then the same block again below. Two-up below lg.
// Dummy films until the real ones arrive: the three photos reused with new crops.
const reviews = [
  // Block 1
  {
    image: "/images/home/review-1.png",
    alt: "A customer holding the SAVA stick",
    duration: "2.19",
    objectPosition: "50% 27%",
    placement: "lg:col-[3/5] lg:row-start-1",
  },
  {
    image: "/images/home/review-2.png",
    alt: "A customer holding the SAVA stick in a store",
    duration: "1.42",
    objectPosition: "50% 50%",
    landscape: true,
    placement: "lg:col-start-1 lg:row-start-2 lg:mt-7",
  },
  {
    image: "/images/home/review-3.png",
    alt: "A smiling customer holding the SAVA stick",
    duration: "0.58",
    objectPosition: "50% 70%",
    placement: "lg:col-[4/6] lg:row-start-2 lg:mt-39",
  },
  // Block 2: the same three positions, a step below block 1
  {
    image: "/images/home/review-1.png",
    alt: "A customer showing the SAVA stick to the camera",
    duration: "1.17",
    objectPosition: "50% 40%",
    placement: "lg:col-[3/5] lg:row-start-3 lg:mt-16",
  },
  {
    image: "/images/home/review-2.png",
    alt: "A customer trying the SAVA stick in a store",
    duration: "2.31",
    objectPosition: "35% 45%",
    landscape: true,
    placement: "lg:col-start-1 lg:row-start-4 lg:mt-7",
  },
  {
    image: "/images/home/review-3.png",
    alt: "A customer smiling after trying the SAVA stick",
    duration: "0.49",
    objectPosition: "50% 45%",
    placement: "lg:col-[4/6] lg:row-start-4 lg:mt-39",
  },
];

export default async function HomeReviews() {
  const product = await getProduct(siteConfig.featuredProductSlug);
  const reviewed = product
    ? { name: product.name, price: formatPrice(displayPrice(product).price), href: productHref(product.slug) }
    : null;

  return (
    <section aria-labelledby="home-reviews" className="relative isolate overflow-clip bg-accent text-paper">
      {/* Live aurora, one viewport tall and pinned while the section scrolls past; the section's
          bg-accent shows beneath it for reduced motion / no WebGL */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <ReviewsCanvas className="sticky top-0 block h-lvh w-full" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-15 mix-blend-overlay" />

      <Frame tone="dark" className="py-section">
        <FrameRule tone="dark" />
        <div className="flex flex-col gap-8 px-inset py-10 lg:flex-row lg:items-center lg:justify-between">
          <SectionHeading
            id="home-reviews"
            eyebrow="User stories"
            title={
              <>
                Real Stories
                <br />
                Real Results
              </>
            }
            align="start"
            tone="dark"
          />
          <div className="flex max-w-sm flex-col items-start gap-6">
            <p className="text-body-lg">
              Advanced sweat control meets lasting fragrance for reliable protection and all-day freshness.
            </p>
            <BlobButton href="/shop" tone="light">
              Shop Now
            </BlobButton>
          </div>
        </div>
        <FrameRule tone="dark" />

        {/* ReviewsMotion: cards drift at their data-scroll-speed over the pinned summary and fade their
            photos in as they arrive. The section clips with overflow-clip, not overflow-hidden, which
            would stop the summary sticking to the viewport. */}
        <ReviewsMotion className="grid gap-8 px-inset pt-16 md:grid-cols-2 lg:grid-cols-[460fr_133fr_299fr_39fr_299fr_54fr] lg:gap-0">
          <RatingSummary />
          {reviews.map((review) => (
            <ReviewCard key={review.alt} review={review} product={reviewed} className={review.placement} />
          ))}
        </ReviewsMotion>
      </Frame>
    </section>
  );
}

function RatingSummary() {
  const full = Math.floor(summary.rating);

  return (
    // RatingMotion: the score and shares count up, the hearts pop in and the bars fill as it scrolls in.
    // Pinned (lg) down the whole first column, under the landscape cards that pass over it — placed by
    // column explicitly, or auto-placement would shift it right to dodge them. Its bottom margin is the
    // cards' drift (--reviews-travel, set by ReviewsMotion), so it lets go where the raised cards end.
    <RatingMotion className="flex max-w-87 flex-col gap-4.5 md:col-span-2 lg:sticky lg:top-[calc(var(--spacing-header)+2.5rem)] lg:col-[1/2] lg:row-[1/5] lg:mb-(--reviews-travel,0px) lg:self-start">
      <div className="flex flex-col gap-2">
        <h3 className="text-h5">Customer Reviews</h3>
        <div className="flex items-start gap-4">
          {/* tabular-nums: the score holds its width while it counts up */}
          <p className="text-h2 tabular-nums">
            <span data-rating-score>{summary.rating}</span>
            <span className="sr-only"> out of 5</span>
          </p>
          <div className="flex flex-col gap-0.5 pt-1">
            <p className="tabular-nums">{summary.count.toLocaleString("en-IN")} reviews</p>
            <span aria-hidden="true" className="flex text-star">
              {Array.from({ length: 5 }, (_, i) => (
                <span key={i} data-rating-heart className="flex">
                  {i < full ? <RiHeart3Fill className="size-3" /> : <RiHeart3Line className="size-3" />}
                </span>
              ))}
            </span>
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-2">
        {summary.breakdown.map((share, i) => (
          <li key={i} className="flex items-center gap-2.5">
            <span className="sr-only">{5 - i} stars:</span>
            <span aria-hidden="true" className="relative h-3 max-w-76 flex-1 rounded-full bg-paper/25">
              <span
                data-rating-bar
                className={cn("absolute inset-y-0 left-0 rounded-full", i === 0 ? "bg-mint" : "bg-paper")}
                style={{ width: `${share}%` }}
              />
            </span>
            <span className="tabular-nums">
              <span data-rating-share>{share}</span>%
            </span>
          </li>
        ))}
      </ul>
    </RatingMotion>
  );
}

interface ReviewCardProps {
  review: (typeof reviews)[number];
  product: { name: string; price: string; href: string } | null;
  className?: string;
}

function ReviewCard({ review, product, className }: ReviewCardProps) {
  return (
    // data-scroll-speed: moves at 1.5× the page's scroll (large screens; see ReviewsMotion).
    // z-10 keeps it above the pinned summary as it passes over.
    <article
      data-scroll-speed="1.5"
      className={cn("relative z-10 flex flex-col gap-4 self-start rounded-3xl glass p-3.5", className)}
    >
      <div
        data-review-media
        className={cn(
          "relative overflow-hidden rounded-xl",
          review.landscape ? "aspect-[432/313]" : "aspect-[310/372]",
        )}
      >
        <Image
          data-review-image
          src={review.image}
          alt={review.alt}
          fill
          sizes="(min-width: 64rem) 30vw, (min-width: 48rem) 50vw, 100vw"
          className="object-cover"
          style={{ objectPosition: review.objectPosition }}
        />
        {/* Video length chip — wire up the review films here when they arrive */}
        <span
          data-review-chip
          aria-hidden="true"
          className="absolute right-3.5 bottom-3.5 flex items-center gap-2 text-caption font-medium tabular-nums"
        >
          {review.duration}
          <span className="center size-8 rounded-full bg-paper/25 backdrop-blur-sm">
            <RiPlayFill className="size-3.5" />
          </span>
        </span>
      </div>

      <div className="relative flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <span role="img" aria-label="Rated 5 out of 5" className="flex gap-0.5 text-star">
            {Array.from({ length: 5 }, (_, i) => (
              <RiStarFill key={i} className="size-3.5" />
            ))}
          </span>
          {product && (
            <div>
              <h3 className="text-h5">
                <Link href={product.href} className="after:absolute after:inset-0">
                  {product.name}
                </Link>
              </h3>
              <p className="text-body-lg tabular-nums">{product.price}</p>
            </div>
          )}
        </div>
        <span className={cn("center shrink-0 rounded-2xl bg-paper", review.landscape ? "size-21.5" : "h-21.5 w-17.5")}>
          <StickThumb />
        </span>
      </div>
    </article>
  );
}
