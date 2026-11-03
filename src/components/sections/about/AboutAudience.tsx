import Image from "next/image";
import { Frame, FrameRule } from "@/components/ui/Frame";
import SectionHeading from "@/components/ui/SectionHeading";

const moments = [
  {
    image: "/images/about/confidence_img_1.png",
    alt: "Sweat on a runner's neck and collarbone after a morning run",
    title: "The 7am Run",
    text: "An early start, a clear mind, and a body ready to move. SAVA keeps you feeling fresh and confident through every step of your morning routine.",
  },
  {
    image: "/images/about/confidence_img_2.png",
    alt: "A hand working at a lab bench with glass pipettes and vials",
    title: "Back-to-Back Meetings",
    text: "A packed schedule, endless conversations, and no time to slow down. SAVA helps you stay fresh, comfortable, and confident from the first meeting to the last.",
  },
  {
    image: "/images/about/confidence_img_3.png",
    alt: "Water drops on a swimmer's shoulder beside a red swimsuit strap",
    title: "The Evening Out",
    text: "From dinner plans to late-night moments, SAVA keeps you feeling fresh and confident, so you can enjoy every moment without worrying about sweat.",
  },
];

/** Who it's for: three moments of a day, each a photo and a line */
export default function AboutAudience() {
  return (
    <section aria-labelledby="about-audience" data-reveal-replay>
      <Frame>
        <SectionHeading
          id="about-audience"
          eyebrow="Who it's for"
          title={
            <>
              Confidence Through
              <br />
              Every Season
            </>
          }
          className="px-inset py-10"
        />
        <FrameRule />
        <ul className="grid gap-x-grid gap-y-10 px-inset py-10 md:grid-cols-3">
          {moments.map(({ image, alt, title, text }) => (
            <li key={title} className="flex flex-col gap-5">
              <div data-reveal="fade" className="relative aspect-6/7 overflow-hidden rounded-2xl bg-surface">
                <Image src={image} alt={alt} fill sizes="(min-width: 48rem) 30vw, 100vw" className="object-cover" />
              </div>
              <div data-reveal className="flex flex-col gap-2">
                <h3 className="text-h5 font-semibold">{title}</h3>
                <p className="text-caption text-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
        <FrameRule />
      </Frame>
    </section>
  );
}
