"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AddressesTab from "@/components/account/AddressesTab";
import OrdersTab from "@/components/account/OrdersTab";
import OverviewTab from "@/components/account/OverviewTab";
import ProfileTab from "@/components/account/ProfileTab";
import Skeleton from "@/components/ui/Skeleton";
import { Tabs, tabPanelProps, type TabItem } from "@/components/ui/Tabs";
import { useAuth } from "@/hooks/useAuth";

export const ACCOUNT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "profile", label: "Profile" },
] as const satisfies readonly TabItem<string>[];

export type AccountTab = (typeof ACCOUNT_TABS)[number]["id"];

export const isAccountTab = (value?: string): value is AccountTab => ACCOUNT_TABS.some((t) => t.id === value);

/** Signed-in dashboard; the active tab lives in the URL (?tab=orders) so it can be linked to */
export default function AccountView({ tab }: { tab: AccountTab }) {
  const router = useRouter();
  const { user, hydrated, isLoggedIn, logout } = useAuth();

  // The proxy already bounces visitors without a session cookie; this covers expired sessions
  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace(`/login?next=${encodeURIComponent(`/account?tab=${tab}`)}`);
  }, [hydrated, isLoggedIn, router, tab]);

  if (!hydrated || !user) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-14 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-stack">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <p className="text-eyebrow text-muted">My account</p>
          <h1>Hello, {user.firstName}</h1>
        </div>
        <button onClick={logout} className="text-cta underline underline-offset-4">
          Sign out
        </button>
      </header>

      <Tabs
        label="Account sections"
        tabs={[...ACCOUNT_TABS]}
        active={tab}
        onChange={(id) => router.replace(`/account?tab=${id}`, { scroll: false })}
      />

      <div {...tabPanelProps(tab)} className="outline-none">
        {tab === "overview" && <OverviewTab user={user} />}
        {tab === "orders" && <OrdersTab userId={user._id} />}
        {tab === "addresses" && <AddressesTab userId={user._id} />}
        {tab === "profile" && <ProfileTab user={user} />}
      </div>
    </div>
  );
}
