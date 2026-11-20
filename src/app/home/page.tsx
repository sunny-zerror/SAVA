import type { Metadata } from "next";
import {
  ExperienceBento,
  ExperienceChrome,
  ExperienceClosing,
  ExperienceDay,
  ExperienceDesign,
  ExperienceFeatures,
  ExperienceHero,
  ExperienceRange,
  ExperienceReadouts,
  ExperienceReviews,
  ExperienceRitual,
  ExperienceSpecs,
  ExperienceStage,
  ExperienceStatement,
  ExperienceStats,
} from "@/components/sections/experience";
import { siteConfig } from "@/config/site";
import { createMetadata } from "@/lib/seo";

// The new product-led home page, previewed here: kept out of search (and the sitemap) until it replaces /
export const metadata: Metadata = createMetadata({
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  absoluteTitle: true,
  path: "/home",
  noIndex: true,
});

export default function ExperiencePage() {
  return (
    <>
      <ExperienceHero />
      <ExperienceStatement />
      <ExperienceDesign />
      <ExperienceRitual />
      <ExperienceFeatures />
      <ExperienceReadouts />
      <ExperienceStats />
      <ExperienceDay />
      <ExperienceReviews />
      <ExperienceBento />
      <ExperienceRange />
      <ExperienceSpecs />
      <ExperienceClosing />
      <ExperienceChrome tab="SAVA stick — 50 ml" />
      {/* The 3D stick that travels the whole page, keyframed by the sections above */}
      <ExperienceStage />
    </>
  );
}
