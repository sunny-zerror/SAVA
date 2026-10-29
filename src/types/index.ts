export * from "./zcommerce";

export interface SiteRoute {
  path: string;
  title: string;
  description: string;
  priority: number;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface Crumb {
  name: string;
  path: string;
}
