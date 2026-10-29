import type { Metadata } from "next";
import { HomeCategories, HomeFeatured, HomeHero, HomeStory } from "@/components/sections/home";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("/");

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeCategories />
      <HomeFeatured />
      <HomeStory />
    </>
  );
}
