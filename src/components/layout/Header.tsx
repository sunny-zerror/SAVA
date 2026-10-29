"use client";

import { RiMenuLine, RiShoppingBag3Line, RiUser3Line } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Logo from "@/components/layout/Logo";
import MobileMenu from "@/components/layout/MobileMenu";
import { mainNav } from "@/config/navigation";
import { useCart } from "@/hooks/useCart";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/utils/cn";

export default function Header() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const openCart = useCartStore((s) => s.open);
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const { count } = useCart();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="container grid h-header grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-8">
            <button onClick={() => setMenuOpen(true)} aria-label="Open menu" className="-ml-2 p-2 md:hidden">
              <RiMenuLine className="size-5" />
            </button>
            <nav aria-label="Main" className="hidden md:block">
              <ul className="flex gap-8">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                      className={cn(
                        "text-cta transition-opacity hover:opacity-60",
                        pathname.startsWith(item.href) && "underline underline-offset-8",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <Logo />

          <div className="flex items-center justify-end gap-1">
            <Link
              href={isLoggedIn ? "/account" : "/login"}
              aria-label={isLoggedIn ? "My account" : "Sign in"}
              className="p-2"
            >
              <RiUser3Line className="size-5" />
            </Link>
            <button onClick={openCart} aria-label={`Open bag, ${count} items`} className="relative -mr-2 p-2">
              <RiShoppingBag3Line className="size-5" />
              {count > 0 && (
                <span className="absolute top-0.5 right-0.5 center size-4 rounded-full bg-ink text-[0.625rem] text-paper">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
      {/* Outside <header>: its backdrop-filter would trap the fixed drawer inside it */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
