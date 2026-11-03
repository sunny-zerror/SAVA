import {
  RiDropLine,
  RiFlowerLine,
  RiHourglass2Line,
  RiLeafLine,
  RiShieldCheckLine,
  RiSparkling2Line,
} from "@remixicon/react";
import Image from "next/image";
import ProductTabs from "@/components/product/ProductTabs";
import FaqAccordion from "@/components/sections/home/FaqAccordion";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import type { ProductContent } from "@/data/product-content";
import type { Product } from "@/types";

// Copy shared by every range: the About photo, the formula, the directions (from the pack) and the questions

const aboutImage = {
  src: "/images/products/shared/sava-about-kinetic.jpg",
  alt: "A SAVA Kinetic stick on a lavender ledge in soft light",
};

const features = [
  { icon: RiHourglass2Line, label: "Long-Lasting" },
  { icon: RiFlowerLine, label: "Refined Scent" },
  { icon: RiDropLine, label: "Sweat-Resistant" },
  { icon: RiSparkling2Line, label: "Fresh All Day" },
];

const ingredients = [
  {
    icon: RiDropLine,
    name: "Sweat-control complex",
    text: "Cuts how much sweat reaches the skin's surface, right where you apply it.",
  },
  {
    icon: RiLeafLine,
    name: "Botanical oils",
    text: "Condition and soothe underarm skin, so everyday use stays comfortable.",
  },
  {
    icon: RiSparkling2Line,
    name: "Fragrance micro-capsules",
    text: "Open gradually as you move, releasing the scent through the day.",
  },
];

const freeFrom = ["Paraben preservatives", "Denatured alcohols", "Artificial dyes"];

const steps = [
  { title: "Twist up", text: "Turn the dial at the base to raise a little of the stick." },
  { title: "Apply", text: "Glide it two or three times over clean, dry underarms — no need to rub it in." },
  { title: "Repeat", text: "For best results use it at night, and again after your morning shower." },
];

const faqs = [
  {
    question: "When should I apply SAVA?",
    answer:
      "At night and again after your morning shower, on clean, dry underarms. Applying at night gives the formula time to settle in while you sweat least.",
  },
  {
    question: "Is it suitable for sensitive skin?",
    answer:
      "Yes. SAVA is dermatologist approved, non-comedogenic and hypoallergenic, and has been clinically tested on hypersensitive underarm skin.",
  },
  {
    question: "How long does the fragrance last?",
    answer:
      "Time-release scent micro-capsules keep it going for up to 24–48 hours, opening as you move through your day.",
  },
  {
    question: "How long does a stick keep?",
    answer: "Use it within 24 months of the manufacturing date printed on the pack.",
  },
];

interface ProductInfoTabsProps {
  product: Product;
  /** The About tab's lists — left out when the product has none */
  content?: ProductContent;
}

/** The product's details in four tabs: about it, what's in it, how to use it, and questions */
export default function ProductInfoTabs({ product, content }: ProductInfoTabsProps) {
  const tabs = [
    { id: "about", label: "About Product", content: <About product={product} content={content} /> },
    { id: "ingredients", label: "Ingredients", content: <Ingredients /> },
    { id: "usage", label: "Usage", content: <Usage /> },
    { id: "faq", label: "FAQ", content: <Faq /> },
  ];

  return (
    // Opens under the story's closing rule: one rule between sections
    <section aria-labelledby="product-details" data-reveal-replay>
      <Frame>
        <h2 id="product-details" className="sr-only">
          Product details
        </h2>
        <ProductTabs tabs={tabs} label="Product details" />
        <FrameRule />
      </Frame>
    </section>
  );
}

function About({ product, content }: ProductInfoTabsProps) {
  // z-commerce stores rich text here; shown as text unless the HTML is trusted and sanitised
  const about = product.description?.replace(/<[^>]+>/g, "");

  return (
    <div className="grid gap-stack md:grid-cols-2 md:items-center lg:gap-16">
      <div data-reveal="fade" className="relative aspect-square overflow-hidden rounded-2xl bg-surface">
        <Image
          src={aboutImage.src}
          alt={aboutImage.alt}
          fill
          sizes="(min-width: 48rem) 45vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col gap-8">
        {about && (
          <div className="flex flex-col gap-3">
            <h3 className="text-h5">About The Product</h3>
            <p className="text-body text-muted">{about}</p>
          </div>
        )}
        {content && (
          <div className="grid gap-8 border-t border-line pt-8 sm:grid-cols-2">
            <Points title="Recommended For" items={content.recommendedFor} />
            <Points title="Suitable For" items={content.suitableFor} />
          </div>
        )}
        <ul data-reveal="stagger" className="grid grid-cols-2 gap-6 pt-4 sm:grid-cols-4">
          {features.map(({ icon: Icon, label }) => (
            <li key={label} className="flex flex-col items-center gap-3 text-center">
              <span className="center size-12 rounded-full bg-surface">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <span className="text-caption text-muted">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Points({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-h6">{title}</h3>
      <ul data-reveal="stagger" className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-caption text-muted">
            <Sparkle className="size-2.5 text-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Ingredients() {
  return (
    <div className="grid gap-stack md:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-h5">What&apos;s Inside</h3>
          <p className="text-body text-muted">
            Three working parts, and nothing your skin doesn&apos;t need. The full ingredients list is on the outer
            packaging.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <h4 className="text-h6">Free From</h4>
          <ul data-reveal="stagger" className="flex flex-wrap gap-2">
            {freeFrom.map((item) => (
              <li key={item} className="rounded-full bg-surface px-4 py-2 text-caption">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul data-reveal="stagger" className="flex flex-col border-t border-line">
        {ingredients.map(({ icon: Icon, name, text }) => (
          <li key={name} className="flex items-start gap-4 border-b border-line py-5">
            <span className="center size-12 shrink-0 rounded-full bg-surface">
              <Icon aria-hidden="true" className="size-5 text-accent" />
            </span>
            <div className="flex flex-col gap-1">
              <h4 className="text-h6">{name}</h4>
              <p className="text-caption text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Usage() {
  return (
    <div className="flex flex-col gap-stack">
      <ol data-reveal="stagger" className="grid gap-8 md:grid-cols-3">
        {steps.map(({ title, text }, i) => (
          <li key={title} className="flex flex-col gap-4 border-t border-line pt-6">
            <span className="center size-10 rounded-full bg-accent text-cta text-paper tabular-nums">{i + 1}</span>
            <div className="flex flex-col gap-1">
              <h3 className="text-h6">{title}</h3>
              <p className="text-caption text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>
      <p data-reveal className="flex items-start gap-3 rounded-2xl bg-surface p-5 text-caption text-muted">
        <RiShieldCheckLine aria-hidden="true" className="size-5 shrink-0 text-accent" />
        External use only. Keep away from direct sunlight and out of children&apos;s reach, and patch test before first
        use.
      </p>
    </div>
  );
}

function Faq() {
  return (
    <div data-reveal>
      <FaqAccordion className="mx-auto flex max-w-3xl flex-col border-t border-line">
        {faqs.map((faq, i) => (
          // expanded: / group-expanded: (not open:) so the styles change as the item animates
          <details
            key={faq.question}
            name="product-faq"
            open={i === 0}
            className="group overflow-hidden border-b border-line"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <h3 className="text-h6 transition-colors duration-500 group-expanded:text-accent">{faq.question}</h3>
              {/* A plus whose upright turns flat into a minus */}
              <span
                aria-hidden="true"
                className="relative center size-4 shrink-0 transition-colors duration-500 group-expanded:text-accent"
              >
                <span className="absolute h-px w-3 bg-current" />
                <span className="absolute h-3 w-px bg-current transition-transform duration-500 ease-out-expo group-expanded:rotate-90" />
              </span>
            </summary>
            <p data-accordion-content className="pb-5 text-caption text-muted">
              {faq.answer}
            </p>
          </details>
        ))}
      </FaqAccordion>
    </div>
  );
}
