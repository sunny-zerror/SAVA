import type { TabItem } from "@/components/ui/Tabs";

/*
 * The account page's tabs. Here rather than in AccountView (a Client Component) so the server page
 * can check the ?tab= it was given.
 */
export const ACCOUNT_TABS = [
  { id: "overview", label: "Overview" },
  { id: "orders", label: "Orders" },
  { id: "addresses", label: "Addresses" },
  { id: "profile", label: "Profile" },
] as const satisfies readonly TabItem<string>[];

export type AccountTab = (typeof ACCOUNT_TABS)[number]["id"];

export const isAccountTab = (value?: string): value is AccountTab => ACCOUNT_TABS.some((t) => t.id === value);
