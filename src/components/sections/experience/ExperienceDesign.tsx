import { cn } from "@/utils/cn";
import ScrollTrack from "./ScrollTrack";

const stepIn =
  "opacity-0 transition-[opacity,translate] duration-700 ease-out-expo data-active:translate-x-0 data-active:opacity-100";

/*
 * One callout per step, each with the stick's pose for it. `side` is where the callout sits; its
 * hairline points in at the stick. `at` is the step's keyframe, as a share of the pinned travel.
 */
const parts = [
  {
    label: "Finish",
    title: "One mould, four finishes",
    text: "Balanced, Kinetic, Renewed and Grounded share the same shape. Only the finish — and the scent inside — changes.",
    side: "right",
    position: "md:top-[38%]",
    pose: { at: 0.08, turn: 2, pitch: 0 },
  },
  {
    label: "Body",
    title: "Oval, waisted body",
    text: "Flatter front to back and narrower through the middle, so it sits in your grip instead of rolling in it.",
    side: "left",
    position: "md:top-[48%]",
    pose: { at: 0.34, turn: 2.25, pitch: 0 },
  },
  {
    label: "Cap",
    title: "Domed cap",
    text: "A soft dome that closes flush with the shoulder, so it travels clean in a bag or a pocket.",
    side: "right",
    position: "md:top-[22%]",
    pose: { at: 0.6, turn: 3, pitch: 32 },
  },
  {
    label: "Knob",
    title: "Ribbed twist knob",
    text: "Set into the foot, front and back, and ribbed for grip — your thumb finds it without looking.",
    side: "left",
    position: "md:top-[66%]",
    pose: { at: 0.86, turn: 3, pitch: -30 },
  },
] as const;

const slot =
  "absolute top-[44%] left-1/2 aspect-1122/1402 h-[min(36svh,24rem)] -translate-1/2 md:top-[54%] md:h-[min(62svh,40rem)]";

/** Design, pinned: the stick turns through its anatomy — front, profile, cap, base — one callout at a time */
export default function ExperienceDesign() {
  return (
    <ScrollTrack
      steps={parts.length}
      aria-labelledby="experience-design"
      data-chapter="Design"
      className="h-[420svh] bg-surface"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="relative container h-full">
          <header className="absolute inset-x-gutter top-[calc(var(--spacing-header)+1.5rem)]">
            <p className="text-kicker text-accent">Design</p>
            <h2 id="experience-design" className="mt-3 max-w-md">
              Shaped around your hand.
            </h2>
          </header>

          {parts.map(({ label, pose }) => (
            <div
              key={label}
              aria-hidden="true"
              data-stick={`design-${label.toLowerCase()}`}
              data-stick-at={pose.at}
              data-stick-turn={pose.turn}
              data-stick-pitch={pose.pitch}
              className={slot}
            />
          ))}

          {parts.map((part, i) => (
            <div
              key={part.title}
              data-step-of={i}
              data-active={i === 0 ? "" : undefined}
              className={cn(
                "absolute inset-x-gutter bottom-24 md:bottom-auto md:w-84",
                part.position,
                part.side === "right"
                  ? "translate-x-6 md:right-gutter md:left-auto lg:right-[16%]"
                  : "-translate-x-6 md:right-auto md:left-gutter lg:left-[16%]",
                stepIn,
              )}
            >
              <div className={cn("flex items-center gap-4", part.side === "left" && "md:flex-row-reverse")}>
                <span aria-hidden="true" className="hidden h-px w-16 bg-ink/30 md:block" />
                <span className="text-kicker text-accent tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <h3 className={cn("mt-4 text-h4", part.side === "left" && "md:text-right")}>{part.title}</h3>
              <p className={cn("mt-2 text-muted", part.side === "left" && "md:text-right")}>{part.text}</p>
            </div>
          ))}

          {/* Where you are in the turn */}
          <ol className="absolute inset-x-gutter bottom-8 flex justify-center gap-6 text-kicker">
            {parts.map(({ label }, i) => (
              <li
                key={label}
                data-step-of={i}
                data-active={i === 0 ? "" : undefined}
                className="text-muted/50 transition-colors duration-500 data-active:text-ink"
              >
                {label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </ScrollTrack>
  );
}
