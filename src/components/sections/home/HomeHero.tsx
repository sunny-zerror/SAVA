"use client";

import { useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { gsap, useGSAP } from "@/lib/gsap";

// Drop a hero film at public/videos/hero.mp4 (and a poster in public/images/home/) to use it
const HERO_VIDEO: string | null = null; // e.g. "/videos/hero.mp4"

export default function HomeHero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-hero-line]", {
          yPercent: 100,
          opacity: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: "expo.out",
          delay: 0.15,
        });
        gsap.from("[data-hero-cta]", { opacity: 0, y: 12, duration: 0.8, delay: 0.6, ease: "power2.out" });
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative flex min-h-[calc(100svh-var(--spacing-header))] items-end overflow-hidden bg-surface"
    >
      {HERO_VIDEO && (
        <video
          className="absolute inset-0 cover"
          src={HERO_VIDEO}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}
      <div className="relative container pb-section">
        <p className="mb-4 overflow-hidden text-eyebrow text-muted">
          <span data-hero-line className="block">
            New season
          </span>
        </p>
        <h1 className="max-w-4xl overflow-hidden">
          <span data-hero-line className="block">
            {siteConfig.tagline}
          </span>
        </h1>
        <div data-hero-cta className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/shop" size="lg">
            Shop the collection
          </ButtonLink>
          <ButtonLink href="/about" size="lg" variant="outline">
            Our story
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
