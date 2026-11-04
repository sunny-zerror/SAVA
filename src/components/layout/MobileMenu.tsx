"use client";

import { RiArrowRightLine, RiInstagramLine, RiLinkedinLine, RiTwitterXLine } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Drawer from "@/components/ui/Drawer";
import Sparkle from "@/components/ui/Sparkle";
import { mainNav, socialNav } from "@/config/navigation";
import { useDrawerMotion } from "@/hooks/useDrawerMotion";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { cn } from "@/utils/cn";

/** An icon for each social link, by label (socialNav) */
const socialIcons: Record<string, typeof RiInstagramLine> = {
  Instagram: RiInstagramLine,
  Linkedin: RiLinkedinLine,
  "X (Twitter)": RiTwitterXLine,
};

/**
 * The site menu behind the header's MENU button — a left panel at every breakpoint. The links run
 * down between hairlines, numbered, and move like the bag (useDrawerMotion): rising into their
 * masks as the hairlines draw out, sinking back before the panel leaves. Hovering a link slides it
 * along, draws an accent line under it from the left, brings in an arrow and dims the rest.
 */
export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const links = [
    { label: "Home", href: "/" },
    ...mainNav,
    isLoggedIn ? { label: "Account", href: "/account" } : { label: "Sign in", href: "/login" },
  ];
  const { scope, shown, requestClose } = useDrawerMotion({ open, onClose });

  return (
    <Drawer
      name="menu-drawer"
      open={shown}
      onClose={requestClose}
      title="Menu"
      side="left"
      heading={
        <p className="flex items-center gap-2 text-kicker text-accent">
          <Sparkle />
          Menu
        </p>
      }
    >
      <div ref={scope} className="flex min-h-full flex-col gap-stack px-6 py-8 md:px-8">
        <nav aria-label="Main">
          {/* Hairlines are their own elements, so they can draw in and out with the links */}
          <span aria-hidden="true" data-drawer-rule className="block h-px bg-line" />
          <ul className="group/nav flex flex-col">
            {links.map((item, i) => {
              const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href} className="relative">
                  <span aria-hidden="true" data-drawer-rule className="absolute inset-x-0 bottom-0 h-px bg-line" />
                  <Link
                    href={item.href}
                    onClick={requestClose}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-5 py-4 transition-opacity duration-500 group-hover/nav:not-[&:hover]:opacity-35 md:py-5",
                      current && "text-accent",
                    )}
                  >
                    {/* The line's mask, as on the headings: it bleeds below so descenders aren't cropped,
                        and fills the row so the hover slide isn't either */}
                    <span className="mb-[-0.12em] block min-w-0 flex-1 overflow-hidden pb-[0.12em] text-h2">
                      <span data-drawer-line className="flex items-center gap-5">
                        <span className="w-6 shrink-0 text-micro text-muted tabular-nums">
                          {current ? <Sparkle className="text-accent" /> : String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-2">
                          {item.label}
                        </span>
                      </span>
                    </span>
                    <RiArrowRightLine
                      aria-hidden="true"
                      className="size-5 shrink-0 -translate-x-3 text-accent opacity-0 transition-[opacity,translate] duration-500 ease-out-expo group-hover:translate-x-0 group-hover:opacity-100"
                    />
                    {/* Drawn over the row's hairline, out from the left */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-out-expo group-hover:scale-x-100"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <ul aria-label="Social" className="mt-auto flex items-center gap-3">
          {socialNav.map((item) => {
            const Icon = socialIcons[item.label];
            return (
              <li key={item.label} data-drawer-extra>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  className="center size-11 rounded-full border border-line transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
                >
                  {Icon ? <Icon aria-hidden="true" className="size-4.5" /> : item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </Drawer>
  );
}
