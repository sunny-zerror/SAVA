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

/** A product in the search drawer: just what its row shows, priced like the listing card */
export interface SearchProduct {
  slug: string;
  name: string;
  scent?: string;
  image: string;
  price: number;
  compareAt: number | null;
}

/** A Sweat School post in the search drawer */
export interface SearchPost {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: { src: string; alt: string; position?: string };
}

/** What /api/search returns: the first few of each, and how many there are in all */
export interface SearchResults {
  products: SearchProduct[];
  productCount: number;
  posts: SearchPost[];
  postCount: number;
}
