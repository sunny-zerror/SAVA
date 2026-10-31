"use client";

import { RiArrowRightUpLine, RiUser3Line } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import RangeStrip from "@/components/product/RangeStrip";
import BlobButton from "@/components/ui/BlobButton";
import Drawer, { drawerRise } from "@/components/ui/Drawer";
import { FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { mainNav, socialNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { cn } from "@/utils/cn";

/** A word beside each link, by href */
const captions: Record<string, string> = {
  "/": "Start here",
  "/shop": "The range",
  "/about": "Our story",
  "/contact": "Say hello",
};

/**
 * The site menu behind the header's MENU button — a left panel at every breakpoint. Content sits
 * between hairline rails like the page Frame: the links (rising in one after another as it opens),
 * the three sticks, then shop / account / contact. Sized by viewport height so it fills tall screens
 * and still fits most short ones; below that the drawer's thin scrollbar takes over.
 */
export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const account = isLoggedIn ? { label: "My account", href: "/account" } : { label: "Sign in", href: "/login" };
  const links = [{ label: "Home", href: "/" }, ...mainNav];
  const { email } = siteConfig.contact;

  const rise = (i: number) => drawerRise(open, i);
  const rangeRise = rise(links.length);
  const footerRise = rise(links.length + 1);

  return (
    <Drawer
      name="menu-drawer"
      open={open}
      onClose={onClose}
      title="Menu"
      side="left"
      size="lg"
      // The wordmark heads the panel; clicking it goes home, so close the menu too
      heading={
        <span onClick={onClose} className="text-ink">
          <Logo />
        </span>
      }
    >
      {/* Rails, like the page Frame */}
      <div className="flex min-h-full flex-col px-6 md:px-8">
        <div className="flex flex-1 flex-col border-x border-line">
          <nav
            aria-label="Main"
            className="flex flex-col gap-[clamp(0.75rem,2.5dvh,1.5rem)] px-inset py-[clamp(1.25rem,4dvh,2.5rem)]"
          >
            <p className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              Menu
            </p>
            <ul className="flex flex-col">
              {links.map((item, i) => {
                const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                const { className, style } = rise(i);
                return (
                  <li key={item.href} className={className} style={style}>
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={current ? "page" : undefined}
                      className={cn(
                        "group flex items-center gap-3 py-0.5 transition-colors duration-300 hover:text-accent",
                        current && "text-accent",
                      )}
                    >
                      {/* The h2 role, but sized by viewport height (not width) so the links fit short screens */}
                      <span className="text-h2 text-[clamp(2rem,5.5dvh,3.25rem)] transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5">
                        {item.label}
                      </span>
                      {current && <Sparkle className="size-3.5" />}
                      {captions[item.href] && (
                        <span className="ml-auto text-caption text-muted transition-colors group-hover:text-accent">
                          {captions[item.href]}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <FrameRule />

          <section
            aria-labelledby="menu-range"
            // Takes the panel's spare height, so tall screens get bigger sticks rather than a gap
            className={cn("flex flex-1 flex-col gap-4 px-inset py-[clamp(1.25rem,3.5dvh,2rem)]", rangeRise.className)}
            style={rangeRise.style}
          >
            <h2 id="menu-range" className="flex items-center gap-2 text-kicker text-accent">
              <Sparkle />
              Shop the range
            </h2>
            <RangeStrip
              onSelect={onClose}
              className="flex-1"
              tileClassName="min-h-[clamp(5.5rem,15dvh,10rem)] flex-1"
            />
          </section>

          <FrameRule />

          <div
            className={cn("flex flex-col gap-6 px-inset py-[clamp(1.25rem,3.5dvh,2rem)]", footerRise.className)}
            style={footerRise.style}
          >
            {/* gap-x-16 leaves room for the BlobButton's hover disc before the account link */}
            <div className="flex flex-wrap items-center gap-x-16 gap-y-4">
              <BlobButton href="/shop" onClick={onClose}>
                Shop now
              </BlobButton>
              <Link
                href={account.href}
                onClick={onClose}
                className="flex items-center gap-2 text-cta transition-colors hover:text-accent"
              >
                <RiUser3Line aria-hidden="true" className="size-4.5" />
                {account.label}
              </Link>
            </div>

            <div className="flex flex-col gap-2.5">
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-3 font-medium transition-colors hover:text-accent"
                >
                  <Sparkle className="text-accent" />
                  {email}
                </a>
              )}
              <ul aria-label="Social" className="flex flex-wrap gap-x-5 gap-y-1 text-muted">
                {socialNav.map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-0.5 transition-colors hover:text-ink"
                    >
                      {item.label}
                      <RiArrowRightUpLine aria-hidden="true" className="size-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Drawer>
  );
}
