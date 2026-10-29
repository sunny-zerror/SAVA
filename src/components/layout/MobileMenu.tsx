"use client";

import Link from "next/link";
import Drawer from "@/components/ui/Drawer";
import { mainNav } from "@/config/navigation";
import { selectIsLoggedIn, useAuthStore } from "@/store/auth-store";

export default function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const isLoggedIn = useAuthStore(selectIsLoggedIn);
  const links = [
    ...mainNav,
    isLoggedIn ? { label: "My Account", href: "/account" } : { label: "Sign In", href: "/login" },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="Menu" side="left">
      <nav aria-label="Mobile">
        <ul className="flex flex-col p-6">
          {links.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className="block border-b border-line py-4 font-primary text-2xl"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Drawer>
  );
}
