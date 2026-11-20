import Image from "next/image";
import CountUp from "./CountUp";
import { experienceMedia } from "./media";

const readouts = [
  {
    id: "stain-free",
    kicker: "No marks. No drama.",
    title: "White shirts. Black silk. Not a trace.",
    text: "Tested on pure white Egyptian cotton and delicate silks with zero residue transfer.",
    label: "Residue transfer, cotton and silk",
    value: 0,
    unit: "",
    image: experienceMedia.stainFree,
    alt: "A folded white cotton shirt and black silk, the SAVA stick lying on top",
  },
  {
    id: "heat",
    kicker: "Built for real heat",
    title: "Made for a 38°C commute.",
    text: "Formulated for Indian summers — humid commutes, hot afternoons and long days that would beat an ordinary deodorant by noon.",
    label: "Composed at",
    value: 38,
    unit: "°C",
    image: experienceMedia.heat,
    alt: "A commuter on a Mumbai local train in the afternoon heat, calm and fresh",
  },
];

/**
 * Two proofs, each full screen after the Oryzo grip readout: a photo drifting behind (parallax), the
 * claim on the left and one big figure that counts up as it arrives.
 */
export default function ExperienceReadouts() {
  return readouts.map((readout) => (
    <section
      key={readout.id}
      aria-labelledby={`experience-${readout.id}`}
      data-chapter="Proof"
      className="relative isolate flex min-h-svh items-end overflow-hidden bg-ink py-section text-paper md:items-center"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image src={readout.image} alt={readout.alt} fill sizes="100vw" data-parallax="0.08" className="object-cover" />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-ink/80 via-ink/30 to-transparent md:bg-linear-to-r md:from-ink/75 md:via-ink/25"
      />

      <div className="container">
        <div data-reveal-replay className="max-w-xl">
          <p data-reveal className="text-kicker text-mint">
            {readout.kicker}
          </p>
          <h2 id={`experience-${readout.id}`} data-heading-effect className="mt-4">
            {readout.title}
          </h2>
          <p data-reveal className="mt-6 text-body-lg text-paper/85">
            {readout.text}
          </p>
          <div data-reveal className="mt-10 border-t border-dotted border-paper/60 pt-6">
            <p className="text-eyebrow text-paper/75">{readout.label}</p>
            <p className="mt-2 text-display">
              <CountUp value={readout.value} />
              {readout.unit}
            </p>
          </div>
        </div>
      </div>
    </section>
  ));
}
