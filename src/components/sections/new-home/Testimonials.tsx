import Image from "next/image";
import { Frame } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { cn } from "@/utils/cn";

interface Story {
  image: string;
  alt: string;
  quote: string;
  name: string;
  /** Where the card sits on the 200vh scroll, from the design */
  place: string;
  /** Quote to the left of the photo instead of the right */
  flip?: boolean;
}

const STORIES: Story[] = [
  {
    image: "/images/newhome/testimonial/img1.png",
    alt: "A man applying a SAVA stick on a sunny balcony",
    quote: "No white marks on my black tees, finally. And the scent doesn't shout.",
    name: "Aisha K., Bengaluru",
    place: "top-[7%] md:right-[4%]",
    flip: true,
  },
  {
    image: "/images/newhome/testimonial/img2.png",
    alt: "A woman applying a SAVA stick in her bathroom",
    quote: "Two workouts and a long commute. Still dry, still fresh at 9pm. I'm converted.",
    name: "Rohan M., Mumbai",
    place: "top-[24%] md:left-[4%]",
  },
  {
    image: "/images/newhome/testimonial/img3.png",
    alt: "A man in sports sunglasses leaning over a table beside a SAVA stick",
    quote: "Gentle enough for my sensitive skin. It just works, every single day.",
    name: "Meera S., Delhi",
    place: "top-[52%] md:left-[51%]",
  },
  {
    image: "/images/newhome/testimonial/img4.png",
    alt: "A woman applying a SAVA stick in her bedroom",
    quote: "Two workouts and a long commute. Still dry, still fresh at 9pm. I'm converted.",
    name: "Rohan M., Mumbai",
    place: "top-[74%] md:left-[7%]",
  },
];

/**
 * "Real Experiences, Real Confidence": 200vh tall. The blue backdrop and the heading are sticky, held in
 * the middle of the screen for the whole section, while the testimonial cards scroll past over them
 * (each rising in as it arrives — data-reveal, src/lib/global.ts). The frame's rails run the full height.
 */
export default function Testimonials() {
  return (
    <section aria-labelledby="stories-heading" className="relative bg-accent">
      {/* Held for the section's length: backdrop + heading */}
      <div className="sticky top-0 flex h-svh items-center justify-center overflow-hidden bg-accent text-paper">
        {/* Soft light pooling in the middle, as in the design */}
        <div aria-hidden="true" className="absolute inset-0 bg-radial from-paper/35 via-paper/10 to-transparent" />
        <div className="relative flex flex-col items-center px-gutter text-center">
          <p className="flex items-center gap-2 text-kicker">
            <Sparkle />
            User stories
          </p>
          <h2 id="stories-heading" data-heading-effect className="mt-4">
            <span data-heading-line className="block">
              Real Experiences,
            </span>
            <span data-heading-line className="block">
              Real Confidence
            </span>
          </h2>
        </div>
      </div>

      {/* The cards, scrolling normally over the held layer */}
      <Frame tone="dark" className="-mt-[100svh] h-[200svh]">
        <ul>
          {STORIES.map((story) => (
            <li
              key={story.image}
              data-reveal
              className={cn(
                "absolute flex w-[min(36rem,92%)] items-start max-md:left-[4%] md:w-[40%]",
                story.flip && "flex-row-reverse max-md:right-[4%] max-md:left-auto",
                story.place,
              )}
            >
              <div className="relative aspect-[5/6] w-[46%] shrink-0 overflow-hidden rounded-2xl">
                <Image
                  src={story.image}
                  alt={story.alt}
                  fill
                  sizes="(min-width: 48rem) 18vw, 42vw"
                  className="object-cover"
                />
              </div>
              <figure
                className={cn(
                  "relative mt-[14%] w-[66%] shrink-0 rounded-xl bg-paper p-4 text-ink md:p-5",
                  story.flip ? "-mr-[12%]" : "-ml-[12%]",
                )}
              >
                <blockquote className="text-body uppercase">{story.quote}</blockquote>
                <figcaption className="mt-3 text-caption text-muted">{story.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Frame>
    </section>
  );
}
