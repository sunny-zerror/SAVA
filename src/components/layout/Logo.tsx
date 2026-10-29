import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/cn";

// Text wordmark until the brand logo arrives — then swap for <Image src="/logo.svg" … />
export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn("font-primary text-2xl tracking-wide", className)}
    >
      {siteConfig.name}
    </Link>
  );
}
