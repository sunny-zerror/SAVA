"use client";

import { RiMenuLine, RiSearchLine, RiShoppingBag3Line } from "@remixicon/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/layout/Logo";
import MobileMenu from "@/components/layout/MobileMenu";
import { useCart } from "@/hooks/useCart";
import { useCartStore } from "@/store/cart-store";
import { cn } from "@/utils/cn";

const action = "flex items-center gap-2.5 p-2 text-kicker transition-opacity hover:opacity-70";

export default function Header() {
  const pathname = usePathname();
  // On the home page the header sits transparent over the hero
  const overlay = pathname === "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const openCart = useCartStore((s) => s.open);
  const { count } = useCart();

  // "Stuck" once the announcement bar has scrolled away and the header is pinned to the top
  // (mt-announcement: the bar is absolute, so the header keeps its place below it)
  const ref = useRef<HTMLElement>(null);
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const top = ref.current?.getBoundingClientRect().top ?? 1;
        setStuck(window.scrollY > 0 && top <= 0);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <>
      <header
        ref={ref}
        // The home intro drops the header in once the curtain clears
        data-site-header
        className={cn(
          "sticky top-0 z-40 mt-announcement border-b transition-[background-color,border-color,color] duration-300 [view-transition-class:site-chrome] [view-transition-name:site-header]",
          stuck
            ? "border-line bg-paper text-ink"
            : overlay
              ? "border-paper/20 text-paper"
              : "border-transparent bg-paper text-ink",
        )}
      >
        <div className="container">
          {/* Side borders line up with the page's frame rails; shown only while the header is white */}
          <div
            className={cn(
              "grid h-header grid-cols-[1fr_auto_1fr] items-center border-x transition-colors duration-300 md:px-inset",
              stuck || !overlay ? "border-rule" : "border-transparent",
            )}
          >
            <div>
              <button onClick={() => setMenuOpen(true)} className={cn(action, "-ml-2")}>
                <RiMenuLine className="size-5" aria-hidden="true" />
                <span className="max-md:sr-only">Menu</span>
              </button>
            </div>

            <Logo />

            <div className="flex items-center justify-end gap-1 md:gap-5">
              {/* No search page yet — the shop listing is the closest thing */}
              <Link href="/shop" className={action}>
                <RiSearchLine className="size-5" aria-hidden="true" />
                <span className="max-md:sr-only">Search</span>
              </Link>
              <button
                onClick={openCart}
                aria-label={`Open cart, ${count} items`}
                className={cn(action, "relative -mr-2")}
              >
                <RiShoppingBag3Line className="size-5" aria-hidden="true" />
                <span aria-hidden="true" className="max-md:hidden">
                  Cart
                </span>
                {/* text-micro, shrunk to 0.625rem so two digits still fit the size-4 circle */}
                {count > 0 && (
                  <span className="absolute top-0.5 left-5 center size-4 rounded-full bg-accent text-micro text-[0.625rem] text-paper tabular-nums">
                    {count}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Outside <header>: its backdrop-filter would trap the fixed drawer inside it */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
