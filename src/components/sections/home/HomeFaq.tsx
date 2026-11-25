import { RiInstagramLine } from "@remixicon/react";
import Image from "next/image";
import JsonLd from "@/components/seo/JsonLd";
import BlobButton from "@/components/ui/BlobButton";
import { Frame, FrameRule } from "@/components/ui/Frame";
import SectionHeading from "@/components/ui/SectionHeading";
import { socialNav } from "@/config/navigation";
import { faqs } from "@/data/faqs";
import FaqAccordion from "./FaqAccordion";

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
              className="group relative isolate overflow-hidden border-b border-line transition-[border-color,border-radius] duration-500 last:border-b-0 expanded:rounded-3xl expanded:border-transparent"
            >
              {/* The open item's backdrop, faded in and out with it */}
              <Image
                src="/images/newhome/faq_bg.svg"
                alt=""
                fill
                sizes="(min-width: 64rem) 64rem, 100vw"
                className="-z-10 object-cover opacity-0 transition-opacity duration-500 group-expanded:opacity-100"
              />
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
            data-reveal
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
