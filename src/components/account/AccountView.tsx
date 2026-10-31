"use client";

import { RiLogoutBoxRLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AddressesTab from "@/components/account/AddressesTab";
import OrdersTab from "@/components/account/OrdersTab";
import OverviewTab from "@/components/account/OverviewTab";
import ProfileTab from "@/components/account/ProfileTab";
import { Button } from "@/components/ui/Button";
import { FrameRule } from "@/components/ui/Frame";
import Skeleton from "@/components/ui/Skeleton";
import Sparkle from "@/components/ui/Sparkle";
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

  // Rendered inside the page's <Frame>: rules run rail to rail, content sits at px-inset
  if (!hydrated || !user) {
    return (
      <div aria-busy="true" aria-label="Loading your account">
        <FrameRule />
        <div className="flex flex-col gap-4 px-inset py-10">
          <Skeleton className="h-5 w-32 rounded-full" />
          <Skeleton className="h-12 w-64 rounded-full md:h-16 md:w-96" />
        </div>
        <FrameRule />
        <div className="flex flex-col gap-8 px-inset py-10">
          <Skeleton className="h-12 w-full max-w-md rounded-full" />
          <Skeleton className="h-64 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <FrameRule />
      <header className="flex flex-col gap-6 px-inset py-10 md:flex-row md:items-end md:justify-between">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="flex items-center gap-2 text-kicker text-accent">
            <Sparkle />
            My account
          </p>
          <h1 data-heading-effect className="wrap-break-word">
            Hello, {user.firstName}
          </h1>
          <p className="text-body-lg text-muted">{user.email}</p>
        </div>
        <Button variant="outline" onClick={logout} className="self-start md:self-auto">
          <RiLogoutBoxRLine aria-hidden="true" className="size-4" />
          Sign out
        </Button>
      </header>
      <FrameRule />

      {/* One rise for the tabs and their panel, on arrival only — switching tabs stays instant */}
      <div data-reveal className="flex flex-col gap-8 px-inset pt-8 md:gap-10 md:pt-10">
        <Tabs
          label="Account sections"
          tabs={[...ACCOUNT_TABS]}
          active={tab}
          onChange={(id) => router.replace(`/account?tab=${id}`, { scroll: false })}
        />

        <div
          {...tabPanelProps(tab)}
          className="rounded-3xl outline-none focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {tab === "overview" && <OverviewTab user={user} />}
          {tab === "orders" && <OrdersTab userId={user._id} />}
          {tab === "addresses" && <AddressesTab userId={user._id} />}
          {tab === "profile" && <ProfileTab user={user} />}
        </div>
      </div>
    </>
  );
}
