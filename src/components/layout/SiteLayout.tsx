import AssistantLauncher from "@/components/assistant/AssistantLauncher";
import CartDrawer from "@/components/layout/CartDrawer";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import SearchDrawer from "@/components/layout/SearchDrawer";
import AppProviders from "@/components/providers/AppProviders";
import { BlobButtonFilter } from "@/components/ui/BlobButton";
import { getAllBlogPosts } from "@/services/blog";
import { getCartSuggestions } from "@/services/catalog";
import { toSearchPost, toSearchProduct } from "@/services/search";

/** Chrome shared by every page: providers, header, footer, the cart and search drawers, and the assistant */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // In-stock products: three for the empty bag, all four to start from in the search drawer and the assistant
  const suggestions = await getCartSuggestions(4);
  const range = suggestions.map(toSearchProduct);

  return (
    <AppProviders>
      <a
        href="#main"
        className="sr-only text-cta focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:bg-paper focus:p-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <CartDrawer suggestions={suggestions.slice(0, 3)} />
      <SearchDrawer products={range} posts={getAllBlogPosts().slice(0, 2).map(toSearchPost)} />
      {/* The shopping assistant: bottom right, not at checkout */}
      <AssistantLauncher products={range} />
      <BlobButtonFilter />
    </AppProviders>
  );
}
