import AnnouncementBar from "@/components/layout/AnnouncementBar";
import CartDrawer from "@/components/layout/CartDrawer";
import Footer from "@/components/layout/Footer";
import FooterModel from "@/components/layout/FooterModel";
import Header from "@/components/layout/Header";
import AppProviders from "@/components/providers/AppProviders";
import { BlobButtonFilter } from "@/components/ui/BlobButton";

/** Chrome shared by every page: providers, header, footer and the cart drawer */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
      {/* The footer's 3D stick: a fixed canvas outside the footer, so it can drop in from above it */}
      <FooterModel />
      <CartDrawer />
      <BlobButtonFilter />
    </AppProviders>
  );
}
