import type { Metadata } from "next";
import {
  HomeBestsellers,
  HomeDifference,
  HomeFaq,
  HomeFeatures,
  HomeHero,
  HomeModel,
  HomeReviews,
  HomeStory,
} from "@/components/sections/home";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata("/");

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <HomeStory />
      <HomeBestsellers />
      <HomeFeatures />
      <HomeDifference />
      <HomeReviews />
      <HomeFaq />
      {/* The product model that travels hero → bestsellers → hand */}
      <HomeModel />
    </>
  );
}
