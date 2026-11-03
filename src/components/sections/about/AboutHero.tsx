import Image from "next/image";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";

const proofs = ["ISO 22716 certified manufacturing", "15 formulation iterations", "Unisex by design"];

/** The About page's opening: eyebrow, the h1 in two lines and the brand line, over the range on velvet */
export default function AboutHero() {
  return (
    // data-reveal-sequence: the opening plays in page order, a step apart
    <section aria-labelledby="about-hero" data-reveal-sequence>
      <Frame>
        <div className="flex flex-col items-center gap-6 px-inset pt-section pb-12 text-center">
          <p data-reveal className="flex items-center gap-2 text-kicker text-accent">
            <Sparkle />
            Our Story
          </p>
          <h1 id="about-hero" data-heading-effect className="max-w-4xl">
            <span data-heading-line className="block">
              Sweat is a problem.
            </span>
            <span data-heading-line className="block">
              We&rsquo;re solving it.
            </span>
          </h1>
          <p data-reveal className="max-w-xl text-body text-muted">
            SAVA is an antiperspirant brand designed for India&rsquo;s climate, combining effective sweat control with
            refined fragrance to keep you feeling fresh, comfortable, and confident every day.
          </p>
        </div>

        <div className="px-inset pb-section">
          <div
            data-reveal="fade"
            className="relative aspect-4/3 overflow-hidden rounded-2xl bg-navy md:aspect-[1586/672]"
          >
            <Image
              src="/images/about/banner.png"
              alt="The SAVA range — Kinetic, Balanced and Renewed — on dark blue velvet beside their packaging"
              fill
              priority
              sizes="(min-width: 90rem) 86rem, 100vw"
              className="object-cover"
            />
            <ul
              data-reveal="stagger"
              className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2 md:inset-x-6 md:bottom-6"
            >
              {proofs.map((proof) => (
                <li key={proof} className="rounded-full bg-paper/15 px-4 py-2 text-caption text-paper backdrop-blur-sm">
                  {proof}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <FrameRule />
      </Frame>
    </section>
  );
}
