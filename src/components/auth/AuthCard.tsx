"use client";

import { RiFileList3Line, RiFlashlightLine, RiMapPin2Line } from "@remixicon/react";
import Image from "next/image";
import { useState } from "react";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { Frame } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { Tabs, tabPanelProps } from "@/components/ui/Tabs";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/cn";

export type AuthMode = "signin" | "signup";

const modes = [
  { id: "signin", label: "Sign in" },
  { id: "signup", label: "Create account" },
] satisfies { id: AuthMode; label: string }[];

// Each side's words: the panel's heading and the line under the form that switches to the other side
const copy: Record<AuthMode, { eyebrow: string; title: string; description: string; switchText: string }> = {
  signin: {
    eyebrow: "Welcome back",
    title: "Sign in",
    description: "Track orders, save addresses and check out faster.",
    switchText: "New here?",
  },
  signup: {
    eyebrow: "Join the club",
    title: "Create account",
    description: "Join to track orders and check out faster.",
    switchText: "Already have an account?",
  },
};

const perks = [
  { text: "Track every order and download invoices", Icon: RiFileList3Line },
  { text: "Save delivery addresses", Icon: RiMapPin2Line },
  { text: "Check out in a few taps", Icon: RiFlashlightLine },
];

interface AuthCardProps {
  /** The side it opens on: /login?mode=signup opens on "Create account" */
  initialMode: AuthMode;
  /** Where to go once signed in or signed up */
  next: string;
}

/**
 * The one sign-in / sign-up page (/login): the brand panel on the left holds the page's heading (and, on
 * wide screens, the club's perks), the form sits beside it under a switch between the two sides. Switching
 * swaps the heading, the form and the line under it in place, and keeps the URL in step (?mode=signup)
 * so a refresh or a shared link opens the same side. On phones the panel shrinks to the heading, above
 * the form.
 */
export default function AuthCard({ initialMode, next }: AuthCardProps) {
  const [mode, setMode] = useState(initialMode);
  const { eyebrow, title, description, switchText } = copy[mode];
  const other = mode === "signin" ? "signup" : "signin";

  function switchTo(to: AuthMode) {
    setMode(to);
    // next= stays; only the side changes, without a navigation
    const url = new URL(window.location.href);
    if (to === "signup") url.searchParams.set("mode", "signup");
    else url.searchParams.delete("mode");
    window.history.replaceState(null, "", url);
    document.title = document.title.replace(copy[mode].title, copy[to].title);
  }

  return (
    <Frame className="pb-section">
      {/* The brand panel, then the form, each rise in as one block (like checkout's two columns) */}
      <div data-reveal="stagger" className="grid gap-8 px-inset py-10 md:py-14 lg:grid-cols-2 lg:gap-14">
        <aside className="relative isolate flex flex-col justify-between gap-10 overflow-hidden rounded-3xl bg-gradient-light p-8 text-paper md:p-10 lg:min-h-136">
          {/* Light pooling top left, navy deepening bottom right, a big star turning slowly behind it all */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-32 -left-32 size-96 origin-top-left animate-glow-breathe rounded-full bg-mist/50 blur-3xl" />
            <div className="absolute -right-24 -bottom-24 size-112 rounded-full bg-navy/35 blur-3xl" />
            <Sparkle className="absolute -top-20 -right-20 size-80 animate-spin-slow text-paper/10" />
            <div className="absolute inset-0 bg-grain opacity-20" />
          </div>

          {/* The stick in orbit: rings round it, a mint dot travelling the dashed one. It tilts to a new
              pose when the side switches */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-40 -bottom-40 -z-10 hidden size-144 lg:block"
          >
            <span className="absolute inset-0 rounded-full border border-paper/20" />
            <span className="absolute inset-16 animate-spin-slow rounded-full border border-dashed border-paper/40">
              <span className="absolute -top-1.5 left-1/2 size-3 rounded-full bg-mint shadow-[0_0_16px] shadow-mint" />
            </span>
            <span className="absolute inset-32 rounded-full border border-paper/20 bg-paper/5" />
          </div>
          <Image
            src="/images/home/hero-stick.png"
            alt=""
            width={1122}
            height={1402}
            sizes="18rem"
            className={cn(
              "pointer-events-none absolute -right-10 -bottom-16 -z-10 hidden w-72 drop-shadow-2xl transition-transform duration-1000 ease-out-expo lg:block",
              mode === "signin" ? "rotate-12" : "-translate-y-6 -rotate-6",
            )}
          />
          {/* Keyed by side, so the new heading rises in when it switches */}
          <header key={mode} className="flex animate-fade-up flex-col gap-4">
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
            {/* Frosted cards, each nudging right on hover */}
            <ul className="flex max-w-xs flex-col gap-2">
              {perks.map(({ text, Icon }) => (
                <li
                  key={text}
                  className="flex items-center gap-3 rounded-2xl border border-paper/30 glass p-2.5 pr-4 text-caption transition-transform duration-500 ease-out-expo hover:translate-x-1.5"
                >
                  <span className="center size-9 shrink-0 rounded-full bg-paper text-accent">
                    <Icon aria-hidden="true" className="size-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="mx-auto flex w-full max-w-md flex-col justify-center gap-8 lg:py-6">
          <Tabs tabs={modes} active={mode} onChange={switchTo} label="Sign in or create an account" stretch />
          {/* Keyed by side: the other form rises in, starting empty */}
          <div key={mode} {...tabPanelProps(mode)} className="animate-fade-up outline-none">
            {mode === "signin" ? <LoginForm next={next} /> : <SignupForm next={next} />}
          </div>
          <p className="border-t border-line pt-6 text-center text-caption text-muted">
            {switchText}{" "}
            <button
              type="button"
              onClick={() => switchTo(other)}
              className="font-medium text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              {other === "signup" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </Frame>
  );
}
