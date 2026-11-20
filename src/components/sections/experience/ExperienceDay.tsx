import Image from "next/image";
import { experienceMedia } from "./media";
import ScrollTrack from "./ScrollTrack";

const moments = [
  {
    time: "06:30",
    title: "The run",
    text: "An early start, a clear mind, and a body ready to move.",
    image: experienceMedia.day.run,
    alt: "A runner pausing at the sea wall on Marine Drive at dawn",
  },
  {
    time: "09:00",
    title: "The commute",
    text: "A packed train, a humid platform, and a crisp shirt that arrives as crisp as it left.",
    image: experienceMedia.day.commute,
    alt: "A commuter on the metro, the SAVA stick in his tote bag",
  },
  {
    time: "13:00",
    title: "The meetings",
    text: "A packed schedule, endless conversations, and no time to slow down.",
    image: experienceMedia.day.meetings,
    alt: "A woman presenting in a sunlit glass meeting room",
  },
  {
    time: "18:30",
    title: "The gym",
    text: "Second session of the day. Same stick, same confidence.",
    image: experienceMedia.day.gym,
    alt: "The SAVA stick on a gym bench beside a water bottle and towel",
  },
  {
    time: "22:00",
    title: "The night out",
    text: "From dinner plans to late-night moments, fresh enough to stay out.",
    image: experienceMedia.day.night,
    alt: "Friends laughing over dinner on a rooftop at night",
  },
];

/**
 * A day with SAVA, pinned: the day's moments slide past sideways as the page scrolls down — held
 * still for the first and last tenth, so the row arrives and leaves at rest.
 */
export default function ExperienceDay() {
  return (
    <ScrollTrack aria-labelledby="experience-day" data-chapter="Life" className="h-[360svh] bg-paper">
      <div className="sticky top-0 flex h-svh flex-col justify-center gap-stack overflow-hidden pt-header">
        <div className="container flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-kicker text-accent">A day with SAVA</p>
            <h2 id="experience-day" className="mt-3 max-w-xl">
              From the first run to the last train.
            </h2>
          </div>
          {/* How far through the day */}
          <div aria-hidden="true" className="h-px w-full bg-line md:w-60">
            <div className="h-full origin-left scale-x-(--track) bg-ink" />
          </div>
        </div>

        <ol
          className="flex w-max gap-grid px-gutter"
          style={{ translate: "calc((100vw - 100%) * clamp(0, (var(--track) - 0.1) / 0.8, 1)) 0" }}
        >
          {moments.map((moment) => (
            <li key={moment.time} className="w-[min(72vw,22rem,40svh)] shrink-0">
              <div className="relative aspect-4/5 overflow-hidden rounded-lg bg-surface">
                <Image
                  src={moment.image}
                  alt={moment.alt}
                  fill
                  sizes="(min-width: 48rem) 22rem, 72vw"
                  className="object-cover"
                />
              </div>
              <p className="mt-5 text-kicker text-accent tabular-nums">
                <time>{moment.time}</time>
              </p>
              <h3 className="mt-2 text-h4">{moment.title}</h3>
              <p className="mt-2 max-w-xs text-muted">{moment.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </ScrollTrack>
  );
}
