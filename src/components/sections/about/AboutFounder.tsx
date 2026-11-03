import Image from "next/image";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";

const facts = [
  { label: "Athlete", value: "Division III track and field" },
  { label: "Trainer", value: "ACE-certified personal trainer" },
  { label: "Finance", value: "Composed at 22°C or 38°C outside" },
  { label: "SAVA", value: "15 formulation iterations with lab and testing partners" },
];

/** The founder's story: why SAVA exists, the facts behind them, and the gym it started in */
export default function AboutFounder() {
  return (
    <section aria-labelledby="about-founder" data-reveal-replay>
      <Frame>
        <div className="grid gap-stack px-inset py-section md:grid-cols-2 md:items-center lg:gap-16">
          <div className="flex flex-col gap-6">
            <p data-reveal className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              Why I started SAVA
            </p>
            <h2 id="about-founder" data-heading-effect>
              It started in the gym.
            </h2>
            <p data-reveal className="text-body text-muted">
              Mid-session, I could feel myself sweating through everything, and I could smell it. I&rsquo;d tried every
              deodorant on the shelf, and none of them held up. Finding a good antiperspirant in India was the problem.
              For a country this hot, the category was strangely underserved. So I built it.
            </p>
            <dl data-reveal="stagger" className="mt-2 flex flex-col border-t border-line">
              {facts.map(({ label, value }) => (
                <div
                  key={label}
                  className="grid grid-cols-[7rem_1fr] items-center gap-4 border-b border-line py-5 md:grid-cols-[8rem_1fr]"
                >
                  <dt className="text-h6">{label}</dt>
                  <dd className="text-caption text-muted">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div data-reveal="fade" className="relative aspect-6/7 overflow-hidden rounded-2xl bg-surface">
            <Image
              src="/images/about/gym_img.png"
              alt="The founder training with a dumbbell in a busy gym"
              fill
              sizes="(min-width: 48rem) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
        <FrameRule />
      </Frame>
    </section>
  );
}
