import type { Metadata } from "next";
import AccountView, { isAccountTab } from "@/components/account/AccountView";
import { Frame } from "@/components/ui/Frame";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({ title: "My account", path: "/account", noIndex: true });

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return (
    <Frame className="py-section">
      <AccountView tab={isAccountTab(tab) ? tab : "overview"} />
    </Frame>
  );
}
