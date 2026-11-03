import Image from "next/image";
import StickBadge from "@/components/sections/home/StickBadge";
import { Frame, FrameRule } from "@/components/ui/Frame";

const stats = [
  { figure: "24H", title: "Long-Lasting Freshness", text: "Designed to keep you feeling fresh throughout your day." },
  {
    figure: "2-in-1",
    title: "Dual-Action Performance",
    text: "Targeted sweat control combined with refined fragrance.",
  },
  {
    figure: "120",
    title: "Patient Dermatological Evaluation",
    text: "Tested for skin compatibility across 120 patients.",
  },
];

/** The stick, its turning badge beside it, and what sets SAVA apart — three figures */
export default function AboutStandard() {
  return (
    <section aria-labelledby="about-standard" data-reveal-replay>
      <Frame>
        <div className="grid gap-stack px-inset py-section md:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-6">
            <h2 id="about-standard" data-heading-effect className="max-w-48 text-h5">
              A New Standard of Freshness
            </h2>
            <div className="relative mx-auto w-full max-w-md">
              <div data-reveal="fade" className="relative aspect-[1060/1252]">
                <Image
                  src="/images/about/product_1.png"
                  alt="A SAVA Balanced stick in Citrus Tide"
                  fill
                  sizes="(min-width: 48rem) 28rem, 90vw"
                  // multiply: the shot's white backdrop melts into the page
                  className="object-contain mix-blend-multiply"
                />
              </div>
              {/* Placed by a wrapper: the badge sets its own position (relative) */}
              <span className="absolute top-1/2 right-0 md:-right-6">
                <StickBadge className="size-28 text-ink" />
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-10">
            <p data-reveal className="text-body-lg text-muted">
              Unlike traditional deodorants that mask odour with fragrance, SAVA targets sweat at its source. By
              combining advanced sweat control with refined fragrance, we deliver a smarter approach to lasting
              freshness, everyday comfort, and confidence.
            </p>
            <dl data-reveal="stagger" className="flex flex-col border-t border-line">
              {stats.map(({ figure, title, text }) => (
                <div
                  key={title}
                  className="grid grid-cols-[8rem_1fr] items-center gap-6 border-b border-line py-8 md:grid-cols-[11rem_1fr]"
                >
                  <dt className="text-h2 whitespace-nowrap tabular-nums">{figure}</dt>
                  <dd className="flex flex-col gap-1">
                    <span className="text-h6">{title}</span>
                    <span className="text-caption text-muted">{text}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
        <FrameRule />
      </Frame>
    </section>
  );
}
