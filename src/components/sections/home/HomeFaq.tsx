import { RiInstagramLine } from "@remixicon/react";
import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import BlobButton from "@/components/ui/BlobButton";
import { Frame, FrameRule } from "@/components/ui/Frame";
import SectionHeading from "@/components/ui/SectionHeading";
import { socialNav } from "@/config/navigation";
import FaqAccordion from "./FaqAccordion";
import FaqBackdrop from "./FaqBackdrop";

const faqs = [
  {
    question: "How long does the fragrance last after application?",
    answer:
      "Thanks to our time-release scent micro-capsule technology, SAVA offers up to 24-48 hours of continuous freshness, adapting to your body movement and everyday rhythm.",
  },
  {
    question: "Is SAVA suitable for all skin types, including sensitive skin?",
    answer:
      "Yes. SAVA is dermatologist approved, non-comedogenic and hypoallergenic, and has been clinically tested on hypersensitive underarm skin.",
  },
  {
    question: "What makes SAVA’s safe and effective for daily use?",
    answer:
      "Every batch is made to cosmetic GMP standards (ISO 22716) and is free from paraben preservatives, denatured alcohols and artificial dyes — so it’s gentle enough to use every day.",
  },
  {
    question: "What makes SAVA’s packaging eco-conscious and modern?",
    answer:
      "Our sticks are designed to use less material and to be easy to recycle, without compromising on a clean, modern look.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

export default function HomeFaq() {
  const instagram = socialNav.find((item) => item.label === "Instagram");

  return (
    <section aria-labelledby="home-faq">
      <JsonLd data={faqSchema} />
      <Frame className="pt-section">
        <FrameRule />
        <SectionHeading
          id="home-faq"
          eyebrow="FAQ"
          title="FAQs: Redefining Fragrance Through Innovation"
          className="px-inset py-10"
        />
        <FrameRule />

        <FaqAccordion className="mx-auto flex max-w-5xl flex-col px-inset py-10 md:py-12">
          {faqs.map((faq, i) => (
            // Shared name: opening one question closes the others
            <details
              key={faq.question}
              name="home-faq"
              open={i === 0}
              // expanded: / group-expanded: (not open:) so the styles change as the item animates
              className="group relative isolate overflow-hidden border-b border-line transition-[background-color,border-color,border-radius] duration-500 last:border-b-0 expanded:rounded-3xl expanded:border-transparent expanded:bg-navy"
            >
              {/* The live aurora over that static backdrop, mounted only while this item is open */}
              <FaqBackdrop />
              {/* Same padding open or shut, so nothing jumps; the answer tucks up into it instead */}
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 px-6 py-8 md:px-10 md:py-12 [&::-webkit-details-marker]:hidden">
                <h3 className="transition-colors duration-500 group-expanded:text-paper">{faq.question}</h3>
                <span
                  aria-hidden="true"
                  className="relative center size-10 shrink-0 rounded-full border border-transparent bg-accent text-paper transition-colors duration-500 group-expanded:border-paper group-expanded:bg-transparent"
                >
                  {/* A plus whose upright turns flat into a minus */}
                  <span className="absolute h-0.5 w-3.5 rounded-full bg-current" />
                  <span className="absolute h-3.5 w-0.5 rounded-full bg-current transition-transform duration-500 ease-out-expo group-expanded:rotate-90" />
                </span>
              </summary>
              <p
                data-accordion-content
                className="-mt-3.5 max-w-3xl px-6 pb-8 text-body-lg text-paper md:-mt-7.5 md:px-10 md:pb-12"
              >
                {faq.answer}
              </p>
            </details>
          ))}
        </FaqAccordion>

        <FrameRule />
        <div className="flex justify-center pt-12 pb-section">
          <BlobButton
            href={instagram?.href ?? "/"}
            target="_blank"
            rel="noopener noreferrer"
            icon={<RiInstagramLine className="size-4" />}
          >
            Sava Club
          </BlobButton>
        </div>
      </Frame>
    </section>
  );
}
