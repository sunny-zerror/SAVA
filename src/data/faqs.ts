/*
 * The store's FAQs. The home page's accordion (HomeFaq, with its FAQPage JSON-LD) and the shopping
 * assistant's answers (src/lib/assistant/replies.ts) both read them, so the two always say the same.
 * The id is how the assistant picks one.
 */

export const faqs = [
  {
    id: "lasting",
    question: "How long does the fragrance last after application?",
    answer:
      "Thanks to our time-release scent micro-capsule technology, SAVA offers up to 24-48 hours of continuous freshness, adapting to your body movement and everyday rhythm.",
  },
  {
    id: "sensitive-skin",
    question: "Is SAVA suitable for all skin types, including sensitive skin?",
    answer:
      "Yes. SAVA is dermatologist approved, non-comedogenic and hypoallergenic, and has been clinically tested on hypersensitive underarm skin.",
  },
  {
    id: "safety",
    question: "What makes SAVA’s safe and effective for daily use?",
    answer:
      "Every batch is made to cosmetic GMP standards (ISO 22716) and is free from paraben preservatives, denatured alcohols and artificial dyes — so it’s gentle enough to use every day.",
  },
  {
    id: "packaging",
    question: "What makes SAVA’s packaging eco-conscious and modern?",
    answer:
      "Our sticks are designed to use less material and to be easy to recycle, without compromising on a clean, modern look.",
  },
] as const;

export type FaqId = (typeof faqs)[number]["id"];

export const faqAnswer = (id: FaqId) => faqs.find((faq) => faq.id === id)?.answer ?? "";
