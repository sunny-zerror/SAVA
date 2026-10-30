import Image from "next/image";
import Link from "next/link";
import { Frame, FrameRule } from "@/components/ui/Frame";
import PageHeader from "@/components/ui/PageHeader";
import Sparkle from "@/components/ui/Sparkle";
import { siteConfig } from "@/config/site";

interface AuthCardProps {
  title: string;
  description: string;
  /** Kicker above the h1 */
  eyebrow?: string;
  footer: { text: string; linkLabel: string; href: string };
  children: React.ReactNode;
}

const perks = ["Track every order and download invoices", "Save delivery addresses", "Check out in a few taps"];

/** Framed sign-in / sign-up page: title band, then the form beside a brand panel on wide screens */
export default function AuthCard({ title, description, eyebrow = "Your account", footer, children }: AuthCardProps) {
  return (
    <Frame className="py-section">
      <FrameRule />
      <PageHeader eyebrow={eyebrow} title={title} description={description} align="center" className="px-inset py-10" />
      <FrameRule />

      <div className="grid gap-10 px-inset py-10 md:py-14 lg:grid-cols-2 lg:gap-14">
        <aside className="relative isolate hidden min-h-[34rem] flex-col justify-between overflow-hidden rounded-3xl bg-navy p-10 text-paper lg:flex">
          <Image src="/images/home/hero-bg.png" alt="" fill sizes="45vw" className="-z-10 object-cover" />
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-20" />
          <Image
            src="/images/home/hero-stick.png"
            alt=""
            width={1122}
            height={1402}
            sizes="18rem"
            className="pointer-events-none absolute -right-10 -bottom-16 -z-10 w-72 rotate-12"
          />
          <p className="flex items-center gap-2 text-kicker">
            <Sparkle />
            {siteConfig.name} Club
          </p>
          <div className="flex flex-col gap-6">
            <p className="max-w-xs font-primary text-4xl leading-tight font-bold">{siteConfig.tagline}</p>
            <ul className="flex max-w-xs flex-col gap-3 text-lg">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <Sparkle className="size-3.5 text-mint" />
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-8 lg:py-6">
          {children}
          <p className="border-t border-line pt-6 text-center text-caption text-muted">
            {footer.text}{" "}
            <Link
              href={footer.href}
              className="font-bold text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {footer.linkLabel}
            </Link>
          </p>
        </div>
      </div>
    </Frame>
  );
}

/** Only allow same-site redirect targets like "/account?tab=orders" */
export const safeNext = (next?: string | string[]) =>
  typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
