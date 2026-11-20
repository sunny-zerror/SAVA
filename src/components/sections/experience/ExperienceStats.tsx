import CountUp from "./CountUp";

const stats = [
  {
    figure: <CountUp value={120} />,
    title: "Patients",
    text: "In dermatological evaluation for skin compatibility, hypersensitive underarm skin included.",
  },
  {
    figure: "24–48h",
    title: "Of freshness",
    text: "Continuous, from time-release scent micro-capsules that open as you move.",
  },
  {
    figure: <CountUp value={0} />,
    title: "Parabens, alcohol or dyes",
    text: "No paraben preservatives, no denatured alcohols, no artificial dyes.",
  },
  {
    figure: "22716",
    title: "ISO standard",
    text: "Made to cosmetic GMP, with traceable batches.",
  },
];

/** The fine print in numbers, after the Oryzo stat cards */
export default function ExperienceStats() {
  return (
    <section aria-labelledby="experience-stats" data-chapter="Proof" className="section bg-paper">
      <div className="container">
        <div data-reveal-replay className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p data-reveal className="text-kicker text-accent">
              In numbers
            </p>
            <h2 id="experience-stats" data-heading-effect className="mt-3 max-w-xl">
              The small print, in big type.
            </h2>
          </div>
          <p data-reveal className="max-w-sm text-muted">
            Every claim on the pack is backed by testing first — so what we promise is what you get.
          </p>
        </div>

        <ul data-reveal="stagger" className="mt-stack grid gap-grid sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.title} className="flex min-h-80 flex-col rounded-lg bg-surface p-inset">
              <p className="text-h1 tabular-nums">{stat.figure}</p>
              <h3 className="mt-auto pt-10 text-h5">{stat.title}</h3>
              <p className="mt-2 text-muted">{stat.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
