import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/cn";

// The SAVA wordmark as a mask, so it takes the current text colour (white over the hero, ink elsewhere)
export default function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} — home`}
      className={cn(
        "block h-6 w-32 bg-current mask-[url(/images/brand/wordmark.png)] mask-contain mask-center mask-no-repeat",
        className,
      )}
    />
  );
}
