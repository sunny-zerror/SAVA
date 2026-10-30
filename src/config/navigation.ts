import { siteConfig } from "@/config/site";
import type { NavItem } from "@/types";

/** Links in the slide-out menu (the header's MENU button) */
export const mainNav: NavItem[] = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const footerNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About us", href: "/about" },
  { label: "New Arrivals", href: "/shop" },
  // No routines page yet — point this at it once it exists
  { label: "Routines", href: "/shop" },
];

// Policy pages still need to be built
export const legalNav: NavItem[] = [
  { label: "Privacy & Policy", href: "/privacy-policy" },
  { label: "Terms & Condition", href: "/terms" },
  { label: "Licences", href: "/licences" },
];

// Falls back to the platform's home page until the brand handles are filled in siteConfig.socials
export const socialNav: NavItem[] = [
  { label: "Instagram", href: siteConfig.socials.instagram || "https://www.instagram.com" },
  { label: "Linkedin", href: siteConfig.socials.linkedin || "https://www.linkedin.com" },
  { label: "X (Twitter)", href: siteConfig.socials.x || "https://x.com" },
];
