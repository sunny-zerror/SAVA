import Image from "next/image";
import { Frame, FrameRule } from "@/components/ui/Frame";
import { cn } from "@/utils/cn";
import FeaturesMotion from "./FeaturesMotion";

const features = [
  {
    title: "Dermatologist Approved",
    text: "Non-comedogenic, hypoallergenic, and clinically tested on hypersensitive axillary skin.",
    icon: "/icons/home/feature-dermatologist.png",
  },
  {
    title: "Skin-Conscious Formula",
    text: "Free from paraben preservatives, denatured alcohols, and artificial dyes.",
    icon: "/icons/home/feature-skin.png",
  },
  {
    title: "Stain-Free Guarantee",
    text: "Tested on pure white Egyptian cotton and delicate silks with zero residue transfer.",
    icon: "/icons/home/feature-stain.png",
  },
  {
    title: "Proven Skin Compatibility",
    text: "Thoughtfully formulated and tested for comfort, cleanliness, and reliable everyday use.",
    icon: "/icons/home/feature-proven.png",
  },
];

// The blue disc and its curved line, in the artwork's 1460×1350 coordinates (measured off the original)
const DISC = { cx: 795, cy: 663.3, r: 663.3 };
const LINE = { radius: 548, startDeg: 72.6 }; // baseline radius; the line starts low on the right, running clockwise

/** Two full clockwise turns from the start angle, so the line can orbit without running off the end */
const LINE_PATH = (() => {
  const at = (deg: number) => {
    const a = (deg * Math.PI) / 180;
    return `${(DISC.cx + LINE.radius * Math.cos(a)).toFixed(1)} ${(DISC.cy + LINE.radius * Math.sin(a)).toFixed(1)}`;
  };
  const arc = (deg: number) => `A ${LINE.radius} ${LINE.radius} 0 0 1 ${at(deg)}`;
  const s = LINE.startDeg;
  return `M ${at(s)} ${arc(s + 180)} ${arc(s + 360)} ${arc(s + 540)} ${arc(s + 720)}`;
})();

/** The four promises around the open hand — the 3D model (HomeModel) comes to rest in the palm */
export default function HomeFeatures() {
  return (
    <FeaturesMotion aria-labelledby="home-features">
      <h2 id="home-features" className="sr-only">
        Why SAVA
      </h2>
      <Frame className="pb-24 lg:pb-32">
        <FrameRule />

        <div className="grid items-center gap-12 px-inset pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-0 lg:pt-24">
          {/* Features step in and out to follow the ring's curve */}
          <ul className="relative z-10 flex flex-col gap-10 max-lg:order-last lg:-mr-10 lg:items-end lg:gap-15">
            {features.map((feature, i) => (
              <li
                data-features-item
                key={feature.title}
                className={cn("flex items-center gap-5", (i === 1 || i === 2) && "lg:mr-26")}
              >
                <div className="flex max-w-83 flex-col gap-2">
                  <h3 className="text-xl">{feature.title}</h3>
                  <p className="text-muted">{feature.text}</p>
                </div>
                <span className="center size-25.5 shrink-0 rounded-full bg-surface max-lg:order-first max-lg:size-20">
                  <Image src={feature.icon} alt="" width={54} height={54} className="size-13.5 max-lg:size-11" />
                </span>
              </li>
            ))}
          </ul>

          {/*
            Built in layers on one 1460×1350 stage (the artwork's own coordinates), back to front:
            disc + curved line (SVG) → hand → contact shadow, fallback stick, the model's slot →
            [the 3D stick, drawn by HomeModel's fixed canvas at z-30] → the palm's front lip (z-35),
            so the stick's base sinks into the cupped palm. No stacking context on the way up here
            (no isolate/transform on the figure), or the lip couldn't rise above the canvas.
          */}
          <figure className="relative">
            <Image
              data-features-ring
              src="/images/home/story-ring.svg"
              alt=""
              width={663}
              height={663}
              unoptimized
              className="absolute top-[1%] left-[-17%] w-[90.8%] max-lg:hidden"
            />
            <div data-features-stage className="relative aspect-1460/1350">
              <svg aria-hidden="true" viewBox="0 0 1460 1350" className="absolute inset-0 size-full overflow-visible">
                <defs>
                  {/* White at the top, settling into SAVA blue at the foot */}
                  <linearGradient id="features-disc-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0.22" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
                    <stop offset="0.45" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.25 }} />
                    <stop offset="0.62" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.48 }} />
                    <stop offset="0.9" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.78 }} />
                  </linearGradient>
                  {/* Fixed to the stage (not the letters), so text reads white on the blue, grey on the white as it orbits */}
                  <linearGradient
                    id="features-line-fill"
                    gradientUnits="userSpaceOnUse"
                    x1="0"
                    y1={DISC.cy + DISC.r}
                    x2="0"
                    y2={DISC.cy - DISC.r}
                  >
                    <stop offset="0.35" style={{ stopColor: "var(--color-paper)" }} />
                    <stop offset="0.6" style={{ stopColor: "var(--color-ink)", stopOpacity: 0.3 }} />
                  </linearGradient>
                  <path id="features-line-path" d={LINE_PATH} fill="none" />
                </defs>
                <g data-features-disc>
                  <circle cx={DISC.cx} cy={DISC.cy} r={DISC.r} className="fill-paper" />
                  <circle cx={DISC.cx} cy={DISC.cy} r={DISC.r} fill="url(#features-disc-fill)" />
                </g>
                <text fill="url(#features-line-fill)" fontSize={76} className="font-primary font-bold">
                  {/* 50% = its resting place on the doubled path (FeaturesMotion orbits it from there) */}
                  <textPath data-features-text href="#features-line-path" startOffset="50%">
                    Performance Meets Personal Care
                  </textPath>
                </text>
              </svg>

              {/* Back layers, moved as one */}
              <div data-features-hand className="absolute inset-0">
                <Image
                  src="/images/home/features-hand.png"
                  alt="An open hand holding the SAVA Balanced stick — performance meets personal care"
                  fill
                  // Eager: the section animates in, and a late-arriving hand would leave its shadow floating
                  loading="eager"
                  sizes="(min-width: 64rem) 730px, 100vw"
                />
                {/* Soft contact shadow where the stick meets the palm */}
                <div
                  aria-hidden="true"
                  className="absolute top-[59.5%] left-[43%] h-[4%] w-[24%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-ink)_45%,transparent),transparent)] blur-[3px]"
                />
                {/* Static stick for reduced motion / no WebGL; the 3D one takes over once live */}
                <Image
                  src="/images/home/features-stick.png"
                  alt=""
                  fill
                  sizes="(min-width: 64rem) 730px, 100vw"
                  className="model-ready:invisible"
                />
                {/* Where the stick stands in the palm: the model's last stop */}
                <div
                  data-model-anchor="hand"
                  data-model-drag
                  className="pointer-events-none absolute top-[11.4%] left-[42%] h-[50.7%] w-[25%] touch-pan-y model-ready:pointer-events-auto model-ready:cursor-grab model-ready:active:cursor-grabbing"
                />
              </div>
              {/* The palm's front lip, over the 3D stick's base */}
              <Image
                data-features-hand
                src="/images/home/features-hand-front.png"
                alt=""
                fill
                loading="eager"
                sizes="(min-width: 64rem) 730px, 100vw"
                className="pointer-events-none z-35"
              />
            </div>
          </figure>
        </div>
      </Frame>
    </FeaturesMotion>
  );
}
