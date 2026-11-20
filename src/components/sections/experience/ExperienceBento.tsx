import Image from "next/image";
import { cn } from "@/utils/cn";
import { experienceMedia } from "./media";

type Tile = {
  title: string;
  text: string;
  className: string;
} & ({ image: string; alt: string } | { image?: undefined; tone: string });

// Four columns, three rows: one big photo, two small, one wide, and two wide type tiles
const tiles: Tile[] = [
  {
    title: "Pocket-sized",
    text: "50 ml in a stick that fits the palm of your hand.",
    image: experienceMedia.bento.pocket,
    alt: "The SAVA stick sliding out of a jeans pocket",
    className: "md:col-span-2 md:row-span-2",
  },
  {
    title: "Unisex",
    text: "Four scents, made for everyone.",
    tone: "bg-navy text-paper",
    className: "",
  },
  {
    title: "One twist",
    text: "A ribbed knob, no mess.",
    image: experienceMedia.bento.twist,
    alt: "A thumb turning the ribbed twist knob at the base of the stick",
    className: "",
  },
  {
    title: "Gym-bag ready",
    text: "Caps flush, travels clean.",
    image: experienceMedia.bento.gymBag,
    alt: "The SAVA stick packed in a gym bag with earbuds, a towel and a bottle",
    className: "md:col-span-2",
  },
  {
    title: "Dual-action",
    text: "Sweat and odour defence in one stick.",
    tone: "bg-mist",
    className: "md:col-span-2",
  },
  {
    title: "Every skin type",
    text: "Sensitive included — dermatologist approved.",
    tone: "bg-surface",
    className: "md:col-span-2",
  },
];

/** Little reasons, after the Oryzo bento of social tiles: photos and type tiles in a tight grid */
export default function ExperienceBento() {
  return (
    <section aria-labelledby="experience-bento" data-chapter="Life" className="section bg-paper">
      <div className="container">
        <div data-reveal-replay>
          <p data-reveal className="text-kicker text-accent">
            Made to move
          </p>
          <h2 id="experience-bento" data-heading-effect className="mt-3 max-w-xl">
            Goes wherever you go.
          </h2>
        </div>

        <ul data-reveal="stagger" className="mt-stack grid auto-rows-60 gap-grid md:grid-cols-4">
          {tiles.map((tile) => (
            <li
              key={tile.title}
              className={cn(
                "relative isolate flex flex-col justify-end overflow-hidden rounded-lg p-inset",
                "tone" in tile ? tile.tone : "text-paper",
                tile.className,
              )}
            >
              {tile.image && (
                <>
                  <Image
                    src={tile.image}
                    alt={tile.alt}
                    fill
                    sizes="(min-width: 48rem) 50vw, 100vw"
                    className="-z-10 object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 bg-linear-to-t from-ink/70 to-transparent"
                  />
                </>
              )}
              <h3 className="text-h4">{tile.title}</h3>
              <p className={cn("mt-1", tile.image ? "text-paper/85" : "opacity-75")}>{tile.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
