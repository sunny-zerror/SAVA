import { RiArrowUpLine, RiDropFill } from "@remixicon/react";
import Image from "next/image";
import BlobButton from "@/components/ui/BlobButton";
import { experienceMedia } from "./media";

/** The pack's own seal: its ring of text turning slowly around the drop */
function Seal({ className }: { className?: string }) {
  return (
    <span className={className}>
      <svg viewBox="0 0 120 120" aria-hidden="true" className="size-full animate-spin-slow">
        <defs>
          <path id="experience-seal-ring" d="M 60 60 m -46 0 a 46 46 0 1 1 92 0 a 46 46 0 1 1 -92 0" fill="none" />
        </defs>
        {/* No type role: its size is in the seal's own units, which a role's font-size would override */}
        <text fill="currentColor" fontSize={9} className="font-secondary font-medium">
          {/* Spread to exactly once round the ring (2π × 46) */}
          <textPath href="#experience-seal-ring" textLength={288} lengthAdjust="spacing">
            DUAL-ACTION • SWEAT AND ODOR DEFENSE •
          </textPath>
        </text>
      </svg>
      <RiDropFill className="absolute top-1/2 left-1/2 size-[30%] -translate-1/2" aria-hidden="true" />
    </span>
  );
}

/**
 * The close, after the second Oryzo reference: a full-bleed scene with a frosted panel over its left
 * third — the wordmark, the invitation, a way to the shop and the line it all comes back to.
 */
export default function ExperienceClosing() {
  return (
    <section
      aria-labelledby="experience-closing"
      data-chapter="Own it"
      className="relative isolate h-svh min-h-160 overflow-hidden bg-ink text-paper"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={experienceMedia.closing}
          alt="The SAVA stick on a sunlit oak shelf beneath a pegboard wall"
          fill
          sizes="100vw"
          data-parallax="0.06"
          className="object-cover"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-[66%] flex-col frost p-inset md:inset-y-0 md:left-0 md:h-auto md:w-[34%] md:pt-[calc(var(--spacing-header)+2rem)]">
        <span
          aria-hidden="true"
          className="block h-7 w-36 bg-current mask-[url(/images/brand/wordmark.svg)] mask-contain mask-left mask-no-repeat max-md:hidden"
        />
        <span className="center size-14 rounded-full bg-paper/15 md:mt-12 md:size-18">
          <RiArrowUpLine className="size-6 md:size-7" aria-hidden="true" />
        </span>
        <div data-reveal-replay>
          <p data-reveal className="mt-6 text-kicker md:mt-10">
            Rise above the heat
          </p>
          <p data-reveal className="mt-4 max-w-sm text-body-lg text-paper/85">
            Four scents, one twist, and a formula built for long, hot days. Pick yours and get moving.
          </p>
          <div data-reveal className="mt-8">
            <BlobButton href="/shop" tone="light" className="w-fit">
              Shop SAVA
            </BlobButton>
          </div>
        </div>

        <div className="mt-auto">
          <hr className="border-t border-dotted border-paper/60" />
          <h2 id="experience-closing" data-heading-effect className="mt-6 text-right uppercase">
            Own your movement
          </h2>
        </div>
      </div>

      <div className="absolute right-gutter bottom-gutter hidden items-center gap-6 md:flex">
        <span className="text-caption">Dual-action sweat and odour defence</span>
        <Seal className="relative size-28" />
      </div>
    </section>
  );
}
