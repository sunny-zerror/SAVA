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

/*
 * Desktop: two lanes, never more than two cards side by side — the left one starting below the pinned
 * summary, then passing over it — with two empty columns between them. Within a lane the cards keep a
 * wide, even gap and sit to one side or the other, so three or four are in view at a time. Each card
 * drifts at its own speed, 1–2.5× the page (see ReviewsMotion): it's where the layout puts it as it
 * crosses the middle of the screen, arriving and leaving faster or slower around that. Below lg the
 * lanes dissolve into the two-up grid.
 */
const lanes = [
  { key: "left", placement: "lg:col-[1/6] lg:pt-96" },
  { key: "right", placement: "lg:col-[8/13] lg:pt-40" },
] as const;

// Dummy films until the real ones arrive: the three photos reused with new crops
const reviews: {
  lane: (typeof lanes)[number]["key"];
  image: string;
  alt: string;
  duration: string;
  objectPosition: string;
  /** Scroll speed, 1–2.5× the page (large screens; see ReviewsMotion) */
  speed: number;
  landscape?: boolean;
  /** Cards sit to the lane's left unless "end" */
  align?: "end";
}[] = [
  {
    lane: "left",
    image: "/images/home/review-3.png",
    alt: "A smiling customer holding the SAVA stick",
    duration: "0.58",
    objectPosition: "50% 70%",
    speed: 1.6,
  },
  {
    lane: "left",
    image: "/images/home/review-2.png",
    alt: "A customer holding the SAVA stick in a store",
    duration: "1.42",
    objectPosition: "50% 50%",
    speed: 2.3,
    landscape: true,
    align: "end",
  },
  {
    lane: "left",
    image: "/images/home/review-1.png",
    alt: "A customer with the SAVA stick in hand",
    duration: "1.05",
    objectPosition: "50% 60%",
    speed: 1.2,
  },
  {
    lane: "left",
    image: "/images/home/review-2.png",
    alt: "A customer picking the SAVA stick off the shelf",
    duration: "1.36",
    objectPosition: "60% 40%",
    speed: 1.9,
    landscape: true,
    align: "end",
  },
  {
    lane: "right",
    image: "/images/home/review-1.png",
    alt: "A customer holding the SAVA stick",
    duration: "2.19",
    objectPosition: "50% 27%",
    speed: 2.1,
    align: "end",
  },
  {
    lane: "right",
    image: "/images/home/review-2.png",
    alt: "A customer trying the SAVA stick in a store",
    duration: "2.31",
    objectPosition: "35% 45%",
    speed: 1.3,
    landscape: true,
  },
  {
    lane: "right",
    image: "/images/home/review-3.png",
    alt: "A customer smiling after trying the SAVA stick",
    duration: "0.49",
    objectPosition: "50% 45%",
    speed: 2.5,
    align: "end",
  },
  {
    lane: "right",
    image: "/images/home/review-2.png",
    alt: "A customer comparing SAVA sticks on the shelf",
    duration: "0.52",
    objectPosition: "45% 55%",
    speed: 1,
    landscape: true,
  },
  {
    lane: "right",
    image: "/images/home/review-3.png",
    alt: "A customer laughing with the SAVA stick",
    duration: "1.48",
    objectPosition: "50% 35%",
    speed: 1.8,
    align: "end",
  },
  {
    lane: "left",
    image: "/images/home/review-1.png",
    alt: "A customer showing the SAVA stick to the camera",
    duration: "1.17",
    objectPosition: "50% 40%",
    speed: 1.4,
  },
];

export default async function HomeReviews() {
  const product = await getProduct(siteConfig.featuredProductSlug);
  const reviewed = product
    ? { name: product.name, price: formatPrice(displayPrice(product).price), href: "/shop" }
    : null;

  return (
    <section aria-labelledby="home-reviews" className="relative isolate overflow-clip bg-accent text-paper">
      {/* Live aurora, one viewport tall and pinned while the section scrolls past; the section's
          bg-accent shows beneath it for reduced motion / no WebGL */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <ReviewsCanvas className="sticky top-0 block h-lvh w-full" />
      </div>
      {/* Grain over it, pinned the same way so the two stay together. The blend sits on the wrapper:
          its -z-10 makes it a stacking context, so a blend inside it would only see an empty layer. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 mix-blend-overlay">
        <div className="sticky top-0 h-lvh w-full bg-grain opacity-15" />
      </div>

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
          <div data-reveal className="flex max-w-sm flex-col items-start gap-6">
            <p className="text-body-lg">
              Advanced sweat control meets lasting fragrance for reliable protection and all-day freshness.
            </p>
            <BlobButton href="/shop" tone="light">
              Shop Now
            </BlobButton>
          </div>
        </div>
        <FrameRule tone="dark" />

        {/* ReviewsMotion: the cards drift at their data-scroll-speed over the pinned summary and fade their
            photos in as they arrive. The section clips with overflow-clip, not overflow-hidden, which
            would stop the summary sticking to the viewport. */}
        <ReviewsMotion className="relative grid gap-8 px-inset pt-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-0">
          <RatingSummary />
          {lanes.map((lane) => (
            // z-10: above the pinned summary as its cards pass over
            <div
              key={lane.key}
              className={cn(
                "contents lg:relative lg:z-10 lg:row-start-1 lg:flex lg:flex-col lg:gap-40 lg:self-start",
                lane.placement,
              )}
            >
              {reviews
                .filter((review) => review.lane === lane.key)
                .map((review) => (
                  <ReviewCard
                    key={review.alt}
                    review={review}
                    product={reviewed}
                    className={cn(review.landscape ? "lg:w-4/5" : "lg:w-3/5", review.align === "end" && "lg:self-end")}
                  />
                ))}
            </div>
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
    // Pinned (lg) in the left lane's columns, under its cards as they pass over — placed explicitly,
    // or auto-placement would shift it aside to dodge them. It lets go where the lanes end.
    <RatingMotion className="flex max-w-87 flex-col gap-4.5 md:col-span-2 lg:sticky lg:top-[calc(var(--spacing-header)+2.5rem)] lg:col-[1/5] lg:row-start-1 lg:self-start">
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
    // data-scroll-speed: drifts at that multiple of the page's scroll (large screens; see ReviewsMotion).
    // Stacked by speed — the faster, nearer cards over the slower ones. The glass card inside makes its
    // own entrance (data-review-card): kept off this element, whose transform belongs to the drift.
    <article
      data-scroll-speed={review.speed}
      style={{ zIndex: Math.round(review.speed * 10) }}
      className={cn("relative", className)}
    >
      <div data-review-card className="relative flex flex-col gap-4 rounded-3xl glass p-3.5">
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
            <span data-review-stars role="img" aria-label="Rated 5 out of 5" className="flex gap-0.5 text-star">
              {Array.from({ length: 5 }, (_, i) => (
                <RiStarFill key={i} className="size-3.5" />
              ))}
            </span>
            {product && (
              <div data-review-info>
                <h3 className="text-h5">
                  <Link href={product.href} className="after:absolute after:inset-0">
                    {product.name}
                  </Link>
                </h3>
                <p className="text-body-lg tabular-nums">{product.price}</p>
              </div>
            )}
          </div>
          <span
            data-review-thumb
            className={cn("center shrink-0 rounded-2xl bg-paper", review.landscape ? "size-21.5" : "h-21.5 w-17.5")}
          >
            <StickThumb />
          </span>
        </div>
      </div>
    </article>
  );
}
