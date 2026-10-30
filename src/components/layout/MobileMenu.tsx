"use client";

import { RiArrowRightUpLine, RiUser3Line } from "@remixicon/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/layout/Logo";
import BlobButton from "@/components/ui/BlobButton";
import { buttonClass } from "@/components/ui/Button";
import Drawer from "@/components/ui/Drawer";
import Sparkle from "@/components/ui/Sparkle";
import { mainNav, socialNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { cn } from "@/utils/cn";

/** The site menu behind the header's MENU button — a left panel at every breakpoint */
export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const account = isLoggedIn ? { label: "My account", href: "/account" } : { label: "Sign in", href: "/login" };
  const links = [{ label: "Home", href: "/" }, ...mainNav];
  const { email } = siteConfig.contact;

  return (
    <Drawer
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
      <div className="flex min-h-full flex-col gap-10 px-6 py-8 md:px-8 md:py-10">
        <nav aria-label="Main">
          <p className="mb-4 flex items-center gap-2 text-kicker text-accent">
            <Sparkle />
            Menu
          </p>
          <ul className="flex flex-col">
            {links.map((item, i) => {
              const current = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href} className="border-b border-line">
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "group flex items-baseline gap-4 py-4 transition-colors hover:text-accent",
                      current && "text-accent",
                    )}
                  >
                    <span aria-hidden="true" className="w-6 text-sm font-bold text-muted tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-primary text-4xl font-bold tracking-tight transition-transform duration-500 ease-out-expo group-hover:translate-x-1.5 md:text-5xl">
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href={account.href}
            onClick={onClose}
            className={buttonClass({ variant: "outline", className: "mt-6" })}
          >
            <RiUser3Line aria-hidden="true" className="size-4" />
            {account.label}
          </Link>
        </nav>

        {/* Brand card on the dark gradient, with the stick peeking in */}
        <div className="relative isolate mt-auto overflow-hidden rounded-3xl bg-navy p-6 text-paper md:p-8">
          <Image src="/images/home/hero-bg.png" alt="" fill sizes="36rem" className="-z-10 object-cover" />
          <Image
            src="/images/home/hero-stick.png"
            alt=""
            width={240}
            height={300}
            className="pointer-events-none absolute -right-6 -bottom-10 -z-10 w-36 rotate-12 md:w-44"
          />
          <p className="flex items-center gap-2 text-kicker">
            <Sparkle />
            {siteConfig.tagline}
          </p>
          <p className="mt-3 max-w-[14rem] font-primary text-2xl leading-tight font-bold md:max-w-xs md:text-3xl">
            Clean ingredients, lasting freshness
          </p>
          <BlobButton href="/shop" tone="light" onClick={onClose} className="mt-6">
            Shop now
          </BlobButton>
        </div>

        <div className="flex flex-col gap-5">
          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-3 font-bold transition-colors hover:text-accent"
            >
              <Sparkle className="text-accent" />
              {email}
            </a>
          )}
          <ul aria-label="Social" className="flex flex-wrap gap-2">
            {socialNav.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1 rounded-full bg-surface px-4 text-sm transition-colors hover:bg-mist"
                >
                  {item.label}
                  <RiArrowRightUpLine aria-hidden="true" className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Drawer>
  );
}
