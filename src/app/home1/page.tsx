import type { Metadata } from "next";
import { CabinetHero } from "@/components/sections/home1";
import { createMetadata } from "@/lib/seo";

// Another take on the home page's opening — the bathroom cabinet — kept out of the index while it's tried out
export const metadata: Metadata = createMetadata({ title: "Home", path: "/home1", noIndex: true });

export default function CabinetHomePage() {
  return <CabinetHero />;
}
