import type { Metadata } from "next";
import AboutContent from "@/components/sections/about/AboutContent";
import PageHeader from "@/components/ui/PageHeader";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("/about");

export default function AboutPage() {
  return (
    <>
      <div className="container pt-section">
        <PageHeader eyebrow="About" title={`About ${siteConfig.name}`} description={siteConfig.tagline} />
      </div>
      <AboutContent />
    </>
  );
}
