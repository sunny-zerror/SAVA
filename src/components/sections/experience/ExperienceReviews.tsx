import { RiDoubleQuotesL, RiStarFill } from "@remixicon/react";
import Image from "next/image";
import { productContent } from "@/data/product-content";
import { testimonials } from "@/data/testimonials";

/** Every range's reviews together: the count, and the score weighted by it */
const ratings = Object.values(productContent).map((content) => content.rating);
const reviewCount = ratings.reduce((sum, rating) => sum + rating.count, 0);
const averageScore = ratings.reduce((sum, rating) => sum + rating.score * rating.count, 0) / reviewCount;

/** Reviews, after the Oryzo testimonials: the overall score, then the customers' own words */
export default function ExperienceReviews() {
  return (
    <section aria-labelledby="experience-reviews" data-chapter="Life" className="section bg-surface">
      <div className="container">
        <div data-reveal-replay className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-reveal className="text-kicker text-accent">
              Rating &amp; reviews
            </p>
            <h2 id="experience-reviews" data-heading-effect className="mt-3 max-w-xl">
              Loved by people who move.
            </h2>
            <p data-reveal className="mt-4 max-w-md text-muted">
              Don&rsquo;t take our word for it — here&rsquo;s what people say after living with it.
            </p>
          </div>
          <div data-reveal className="flex items-end gap-4">
            <p className="text-h1 tabular-nums">
              {averageScore.toFixed(1)}
              <span className="text-h4 text-muted">/5</span>
            </p>
            <div className="pb-2">
              <span role="img" aria-label={`Rated ${averageScore.toFixed(1)} out of 5`} className="flex text-star">
                {Array.from({ length: 5 }, (_, i) => (
                  <RiStarFill key={i} className="size-4" aria-hidden="true" />
                ))}
              </span>
              <p className="mt-1 text-caption text-muted tabular-nums">{reviewCount.toLocaleString("en-IN")} reviews</p>
            </div>
          </div>
        </div>

        <ul data-reveal="stagger" className="mt-stack grid gap-grid md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((review) => (
            <li key={review.name} className="flex flex-col rounded-lg bg-paper p-inset">
              <RiDoubleQuotesL className="size-6 text-accent" aria-hidden="true" />
              <blockquote className="mt-4 text-body-lg">{review.quote}</blockquote>
              <div className="mt-auto flex items-center gap-4 pt-8">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-surface">
                  <Image src={review.image} alt="" fill sizes="48px" className="object-cover" />
                </span>
                <p>
                  <span className="block text-h6">{review.name}</span>
                  <span className="text-caption text-muted">
                    {review.role}, {review.city}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
