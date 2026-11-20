import { cn } from "@/utils/cn";
import ScrollTrack from "./ScrollTrack";

const steps = [
  { title: "Uncap", text: "Lift the domed cap off. The formula sits ready underneath." },
  { title: "Twist up", text: "Turn the ribbed knob at the base until the formula just clears the rim." },
  { title: "Glide", text: "Two or three strokes on clean, dry underarms." },
  { title: "Cap and go", text: "Twist it back down, cap on, and get moving." },
];

// The stick acts each step out: cap off → twisted up → tilted to glide → closed again
const keyframes = [
  { name: "ritual", at: 0.04, cap: 0, rise: 0, tilt: 0 },
  { name: "ritual-uncap", at: 0.2, cap: 1, rise: 0, tilt: 0 },
  { name: "ritual-twist", at: 0.45, cap: 1, rise: 1, tilt: 0 },
  { name: "ritual-glide", at: 0.7, cap: 1, rise: 1, tilt: 28 },
  { name: "ritual-close", at: 0.95, cap: 0, rise: 0, tilt: 0 },
];

// Low and a little smaller than the other chapters' slots: the cap needs headroom to lift off
const slot =
  "absolute top-[48%] left-1/2 aspect-1122/1402 h-[min(30svh,20rem)] -translate-1/2 md:top-[60%] md:left-[70%] md:h-[min(50svh,32rem)]";

/** How to use, pinned on navy: four steps down the left, acted out by the stick on the right */
export default function ExperienceRitual() {
  return (
    <ScrollTrack
      steps={steps.length}
      aria-labelledby="experience-ritual"
      data-chapter="How to use"
      className="h-[420svh] bg-navy text-paper"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="relative container h-full">
          <header className="absolute inset-x-gutter top-[calc(var(--spacing-header)+1.5rem)]">
            <p className="text-kicker text-mint">How to use</p>
            <h2 id="experience-ritual" className="mt-3">
              Twist. Glide. Go.
            </h2>
          </header>

          {keyframes.map(({ name, at, cap, rise, tilt }) => (
            <div
              key={name}
              aria-hidden="true"
              data-stick={name}
              data-stick-at={at}
              data-stick-turn="3"
              data-stick-cap={cap}
              data-stick-rise={rise}
              data-stick-tilt={tilt}
              className={slot}
            />
          ))}

          {/* The glide: three strokes drawn in beside the formula while step 3 is on */}
          <svg
            aria-hidden="true"
            viewBox="0 0 200 120"
            data-step-of="2"
            className="absolute top-[24%] left-1/2 w-[min(44vw,15rem)] -translate-x-1/2 text-mint opacity-0 transition-opacity duration-500 data-active:opacity-100 md:top-[20%] md:left-[70%] md:w-[min(24vw,22rem)] [&_path]:transition-[stroke-dashoffset] [&_path]:duration-1000 [&_path]:ease-out-expo [&_path]:[stroke-dasharray:1] [&_path]:[stroke-dashoffset:1] data-active:[&_path]:[stroke-dashoffset:0]"
          >
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d={`M ${20 + i * 8} ${92 - i * 26} Q 100 ${58 - i * 26} ${180 - i * 8} ${92 - i * 26}`}
                pathLength={1}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                style={{ transitionDelay: `${i * 160}ms` }}
              />
            ))}
          </svg>

          <ol className="absolute inset-x-gutter bottom-16 grid md:top-[calc(var(--spacing-header)+11rem)] md:bottom-auto md:w-[38%] md:gap-8">
            {steps.map((step, i) => (
              <li
                key={step.title}
                data-step-of={i}
                data-active={i === 0 ? "" : undefined}
                className={cn(
                  "flex gap-5 transition-opacity duration-500 data-active:opacity-100",
                  // Phones show the current step alone; wider screens list them all, the current one lit
                  "max-md:col-start-1 max-md:row-start-1 max-md:opacity-0 md:opacity-35",
                )}
              >
                <span className="text-kicker text-mint tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="text-h4">{step.title}</h3>
                  <p className="mt-2 text-paper/75">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </ScrollTrack>
  );
}
