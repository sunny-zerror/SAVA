import type { Metadata } from "next";
import { HomeBestsellers, HomeDifference, HomeFaq } from "@/components/sections/home";
import { CareShowcase, NewHomeHero, Testimonials } from "@/components/sections/new-home";
import { createMetadata } from "@/lib/seo";

// The new home page, built here before it replaces "/" — kept out of the index until then
export const metadata: Metadata = createMetadata({ title: "Home", path: "/home", noIndex: true });

export default function NewHomePage() {
  return (
    <>
      {/* The hero's 3D stick (HeroStick) carries on into the middle bestseller card, then the care showcase */}
      <NewHomeHero />
      <HomeBestsellers />
      <CareShowcase />
      <HomeDifference />
      <Testimonials />
      <HomeFaq />
    </>
  );
}
