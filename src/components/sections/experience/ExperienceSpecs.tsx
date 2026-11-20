import Image from "next/image";
import { experienceMedia } from "./media";

const specs = [
  ["Format", "Twist-up stick, 50 ml"],
  ["Type", "Antiperspirant deodorant, for underarms"],
  ["Protection", "Dual-action sweat and odour defence"],
  ["Scents", "Citrus Tide · Silver Lining · Forest Air · Amber Wood"],
  ["Fragrance", "Unisex, released through the day by scent micro-capsules"],
  ["Skin", "All skin types, sensitive included — non-comedogenic, hypoallergenic"],
  ["Free from", "Paraben preservatives, denatured alcohols, artificial dyes"],
  ["Tested", "Dermatological evaluation across 120 patients; zero residue on cotton and silk"],
  ["Made", "To ISO 22716 cosmetic GMP, with traceable batches"],
  ["How to use", "Twist up and apply to clean, dry underarms"],
];

/** Tech specs, after the Oryzo "paper": the four sticks in a row, then everything in the stick */
export default function ExperienceSpecs() {
  return (
    <section aria-labelledby="experience-specs" data-chapter="Specs" className="section relative bg-paper">
      {/* The stick bows out here, shrinking away as the specs arrive */}
      <div
        aria-hidden="true"
        data-stick="specs"
        data-stick-fit="0"
        data-stick-turn="6"
        className="absolute top-0 left-1/2 aspect-1122/1402 h-[30svh] -translate-x-1/2"
      />

      <div className="container">
        <div data-reveal-replay>
          <p data-reveal className="text-kicker text-accent">
            Tech specs
          </p>
          <h2 id="experience-specs" data-heading-effect className="mt-3 max-w-xl">
            Everything in the stick.
          </h2>
        </div>

        <div
          data-reveal="image"
          className="relative mt-stack aspect-video overflow-hidden rounded-lg bg-surface md:aspect-21/9"
        >
          <Image
            src={experienceMedia.lineup}
            alt="The four SAVA sticks in a row: Balanced, Kinetic, Renewed and Grounded"
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <dl data-reveal="stagger" className="mt-stack grid gap-x-grid md:grid-cols-2">
          {specs.map(([term, detail]) => (
            <div key={term} className="grid gap-1 border-b border-line py-5 sm:grid-cols-[10rem_1fr] sm:gap-6">
              <dt className="text-eyebrow text-muted">{term}</dt>
              <dd className="text-body-lg">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
