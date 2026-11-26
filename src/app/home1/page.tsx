import type { Metadata } from "next";
import { CabinetBackdrop, CabinetBestsellers, CabinetHero, CabinetPack } from "@/components/sections/home1";
import { createMetadata } from "@/lib/seo";
import { HomeDifference, HomeFaq } from "@/components/sections/home";
import { Testimonials } from "@/components/sections/new-home";

// Another take on the home page's opening — the bathroom cabinet — kept out of the index while it's tried out
export const metadata: Metadata = createMetadata({ title: "Home", path: "/home1", noIndex: true });

export default function CabinetHomePage() {
  return (
    <>
      {/* The hero ends on the backdrop's blue, and the bestsellers scroll up over it; the hero's stick
          (CabinetTraveller) carries on into the middle bestseller card, then into its carton (CabinetPack) */}
      <CabinetBackdrop>
        <CabinetHero />
        <CabinetBestsellers />
      </CabinetBackdrop>
      <CabinetPack />
      <HomeDifference />
      <Testimonials />
      <HomeFaq />
    </>
  );
}
