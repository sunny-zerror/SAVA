import Image from "next/image";
import { Frame, FrameRule } from "@/components/ui/Frame";
import { cn } from "@/utils/cn";

const photos = {
  holding: {
    src: "/images/products/shared/sava-story-hand.png",
    alt: "A hand holding a SAVA Kinetic stick against deep blue",
  },
  active: {
    src: "/images/products/shared/sava-story-runner.png",
    alt: "A runner mid-stride on a country path under a stormy sky",
  },
};

const notes = {
  application: {
    title: "Application",
    text: "Twist up a little of the stick and glide it two or three times over clean, dry underarms — no need to rub it in. For best results apply it at night, when you sweat least, and again after your morning shower, giving it a minute to set before you dress.",
    // Light pooling up from the lower right
    glow: "bg-radial-[at_90%_100%] from-accent via-accent/45 to-navy to-75%",
  },
  formula: {
    title: "The Formula",
    text: "SAVA pairs an advanced sweat-control complex with skin-conditioning botanical oils and time-release fragrance micro-capsules that open as you move. Dermatologist approved and made to cosmetic GMP standards, it's free from paraben preservatives, denatured alcohols and artificial dyes — gentle enough for every day, and built to keep up with it.",
    glow: "bg-radial-[at_15%_75%] from-accent/90 via-accent/35 to-navy to-80%",
  },
};

// overflow-clip, not -hidden: a clipping box that isn't a scroll container keeps aspect-ratio's
// automatic minimum, so a note grows past its shape when its copy needs the room instead of cutting it
// off. self-stretch: grid items with an aspect ratio don't stretch by default, so a photo would stop
// short of the taller note beside it
const cell = "relative aspect-5/6 self-stretch overflow-clip rounded-2xl md:aspect-square";

/**
 * Below the product: the headline, then a checkerboard of two photos and two notes (how to apply it,
 * what's in it). The notes sit on the brand's deep blue, ruled like the page's frame.
 */
export default function ProductStory() {
  return (
    // Opens under the product's closing rule, and closes on its own: one rule between sections
    // data-reveal-replay: its entrances play on the way down and reverse on the way back up
    <section aria-labelledby="product-story" data-reveal-replay>
      <Frame>
        {/* Wide enough for two balanced lines on desktop: "…Recover from / the Pressures…" */}
        <h2 id="product-story" data-heading-effect className="max-w-5xl px-inset py-10">
          Helping Modern Skin Recover from the Pressures of Everyday Living
        </h2>
        <FrameRule />
        {/* As each cell scrolls in: the photos fade in; the notes' blue fades in, then their rules
            and title, and the copy rises */}
        <div className="grid gap-3 px-inset py-10 md:grid-cols-2 md:gap-4">
          <Photo {...photos.holding} />
          <Note {...notes.application} />
          <Note {...notes.formula} />
          <Photo {...photos.active} />
        </div>
        <FrameRule />
      </Frame>
    </section>
  );
}

function Photo({ src, alt }: { src: string; alt: string }) {
  return (
    <div data-reveal="fade" className={cn(cell, "bg-surface")}>
      <Image src={src} alt={alt} fill sizes="(min-width: 48rem) 45vw, 100vw" className="object-cover" />
    </div>
  );
}

function Note({ title, text, glow }: { title: string; text: string; glow: string }) {
  return (
    <article data-reveal="fade" className={cn(cell, "isolate flex flex-col bg-navy text-paper")}>
      <div aria-hidden="true" className={cn("absolute inset-0 -z-10", glow)} />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-20 mix-blend-overlay" />
      <Rules />
      <h3 data-heading-effect className="px-10 pt-6">
        {title}
      </h3>
      {/* pt-12: clears the rule under the title when the copy, not the cell's shape, sets the height */}
      <p data-reveal className="mt-auto px-10 pt-12 pb-16 text-body text-paper/85 lg:text-body-lg">
        {text}
      </p>
    </article>
  );
}

/** The note's ruled grid: a rule under the title and one under the copy, across two uprights, dotted where they cross */
function Rules() {
  const rows = ["top-20", "bottom-10"];
  const cols = ["left-6", "right-6"];
  return (
    <div aria-hidden="true" data-reveal="fade" className="pointer-events-none absolute inset-0">
      {cols.map((x) => (
        <span key={x} className={cn("absolute inset-y-0 w-px bg-paper/15", x)} />
      ))}
      {rows.map((y) => (
        <span key={y} className={cn("absolute inset-x-0 h-px bg-paper/15", y)} />
      ))}
      {rows.flatMap((y) =>
        cols.map((x) => (
          <span
            key={`${y}-${x}`}
            className={cn(
              "absolute size-1.5 rounded-full bg-paper/70",
              y,
              x,
              y.startsWith("top") ? "-translate-y-1/2" : "translate-y-1/2",
              x.startsWith("left") ? "-translate-x-1/2" : "translate-x-1/2",
            )}
          />
        )),
      )}
    </div>
  );
}
