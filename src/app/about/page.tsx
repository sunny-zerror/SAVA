import type { Metadata } from "next";
import AboutAudience from "@/components/sections/about/AboutAudience";
import AboutFounder from "@/components/sections/about/AboutFounder";
import AboutHero from "@/components/sections/about/AboutHero";
import AboutPrinciples from "@/components/sections/about/AboutPrinciples";
import AboutStandard from "@/components/sections/about/AboutStandard";
import AboutTestimonials from "@/components/sections/about/AboutTestimonials";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("/about");

// One rule between sections: each closes on its own rule and the next opens under it
export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutStandard />
      <AboutAudience />
      <AboutFounder />
      <AboutPrinciples />
      <AboutTestimonials />
    </>
  );
}
