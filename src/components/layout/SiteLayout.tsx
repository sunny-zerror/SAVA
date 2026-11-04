import AnnouncementBar from "@/components/layout/AnnouncementBar";
import CartDrawer from "@/components/layout/CartDrawer";
import Footer from "@/components/layout/Footer";
import FooterModel from "@/components/layout/FooterModel";
import Header from "@/components/layout/Header";
import PageCurtain from "@/components/layout/PageCurtain";
import AppProviders from "@/components/providers/AppProviders";
import { BlobButtonFilter } from "@/components/ui/BlobButton";
import { getCartSuggestions } from "@/services/catalog";

/** Chrome shared by every page: providers, header, footer and the cart drawer */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // Shown in the bag while it's empty
  const suggestions = await getCartSuggestions();

  return (
    <AppProviders>
      <a
        href="#main"
        className="sr-only text-cta focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:bg-paper focus:p-3"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main">{children}</main>
      <Footer />
      {/* The footer's 3D stick: a fixed canvas outside the footer, clipped to it, that drops in through its top edge */}
      <FooterModel />
      <CartDrawer suggestions={suggestions} />
      <BlobButtonFilter />
      {/* The page transition (template.tsx): a white curtain with a tagline */}
      <PageCurtain />
    </AppProviders>
  );
}
