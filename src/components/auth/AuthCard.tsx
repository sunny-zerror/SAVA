import Image from "next/image";
import Link from "next/link";
import { Frame } from "@/components/ui/Frame";
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

/**
 * Framed sign-in / sign-up page: the brand panel on the left holds the page's heading (and, on wide
 * screens, the club's perks), the form sits beside it. On phones the panel shrinks to the heading,
 * above the form.
 */
export default function AuthCard({ title, description, eyebrow = "Your account", footer, children }: AuthCardProps) {
  return (
    <Frame className="pb-section">
      {/* The brand panel, then the form, each rise in as one block (like checkout's two columns) */}
      <div data-reveal="stagger" className="grid gap-8 px-inset py-10 md:py-14 lg:grid-cols-2 lg:gap-14">
        <aside className="relative isolate flex flex-col justify-between gap-10 overflow-hidden rounded-3xl bg-gradient-light p-8 text-paper md:p-10 lg:min-h-136">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-20" />
          <Image
            src="/images/home/hero-stick.png"
            alt=""
            width={1122}
            height={1402}
            sizes="18rem"
            className="pointer-events-none absolute -right-10 -bottom-16 -z-10 hidden w-72 rotate-12 lg:block"
          />
          <header className="flex flex-col gap-4">
            <p className="flex items-center gap-2 text-kicker">
              <Sparkle />
              {eyebrow}
            </p>
            <h1>{title}</h1>
            <p className="max-w-sm text-body-lg text-paper/85">{description}</p>
          </header>
          <div className="hidden flex-col gap-5 lg:flex">
            <p className="flex items-center gap-2 text-kicker">
              <Sparkle className="text-mint" />
              {siteConfig.name} Club
            </p>
            <ul className="flex max-w-xs flex-col gap-3 text-body-lg">
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
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
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
