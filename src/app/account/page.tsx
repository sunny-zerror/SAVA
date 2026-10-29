import type { Metadata } from "next";
import AccountView, { isAccountTab } from "@/components/account/AccountView";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "My account", path: "/account", noIndex: true });

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return (
    <section className="section container">
      <AccountView tab={isAccountTab(tab) ? tab : "overview"} />
    </section>
  );
}
