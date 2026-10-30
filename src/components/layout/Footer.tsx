import Image from "next/image";
import Link from "next/link";
import ReviewsCanvas from "@/components/sections/home/ReviewsCanvas";
import BlobButton from "@/components/ui/BlobButton";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Sparkle from "@/components/ui/Sparkle";
import { footerNav, legalNav, socialNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export default function Footer() {
  const { email } = siteConfig.contact;
  const { street, city, state, postalCode } = siteConfig.address;
  const address = [street, city, [state, postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <footer className="relative isolate overflow-hidden bg-navy text-paper">
      {/* Live aurora (bg-navy shows for reduced motion / no WebGL), with grain */}
      <ReviewsCanvas className="absolute inset-0 -z-10 size-full" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-15 mix-blend-overlay" />

      <Frame tone="dark" className="pt-12 md:pt-20">
        <FrameRule tone="dark" />

        <div className="grid gap-10 px-inset py-10 lg:grid-cols-12">
          <div className="flex flex-col items-start gap-8 lg:col-span-6">
            <h2 data-heading-effect>
              Clean Ingredients
              <br />
              Health Skin
            </h2>
            <BlobButton href="/shop" tone="light">
              Explore Collection
            </BlobButton>
          </div>

          <nav aria-label="Footer" className="lg:col-span-2 lg:col-start-9">
            <ul className="flex flex-col gap-4 text-2xl font-bold">
              {footerNav.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-opacity hover:opacity-70">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Social" className="lg:col-span-1 lg:col-start-12">
            <ul className="flex flex-col gap-2.5 text-lg whitespace-nowrap">
              {socialNav.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-opacity hover:opacity-70"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <FrameRule tone="dark" />
        {/* Band for the SAVA watermark */}
        <div aria-hidden="true" className="relative h-56 md:h-78">
          <span className="absolute inset-x-[2%] inset-y-[12%] bg-paper/15 mask-[url(/images/brand/wordmark.png)] mask-contain mask-center mask-no-repeat" />
        </div>
        <FrameRule tone="dark" />

        <div className="grid gap-8 px-inset pt-14 pb-12 lg:grid-cols-12">
          <nav aria-label="Legal" className="lg:col-span-2 lg:col-start-7">
            <ul className="flex flex-col gap-2.5 text-lg">
              {legalNav.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition-opacity hover:opacity-70">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address className="flex flex-col gap-5 text-xl font-bold not-italic lg:col-span-4 lg:col-start-9">
            {email && (
              <a href={`mailto:${email}`} className="flex items-center gap-4 transition-opacity hover:opacity-70">
                <Sparkle className="size-4.5" />
                {email}
              </a>
            )}
            {address && (
              <p className="flex items-center gap-4">
                <Sparkle className="size-4.5" />
                {address}
              </p>
            )}
          </address>
        </div>
      </Frame>

      {/*
        The rock ledge, flush with the bottom-left corner (in flow below the content on small screens).
        The SAVA stick stands on it: FooterModel drops its 3D stick into this slot as the footer
        scrolls in, landing as the footer bottoms out; for reduced motion / no WebGL, the static one.
      */}
      <div className="relative w-[min(70vw,24rem)] lg:absolute lg:bottom-0 lg:left-0 lg:w-[clamp(15rem,30vw,27rem)]">
        <Image
          src="/images/home/footer-rock.png"
          alt=""
          width={432}
          height={250}
          sizes="(min-width: 64rem) 30vw, 70vw"
          className="w-full"
        />
        {/* Where the stick stood in the artwork: on the top face, a little right of the ledge's lip */}
        <div
          data-footer-model-anchor
          className="pointer-events-none absolute bottom-[63.2%] left-[37%] aspect-176/344 w-[40.7%] touch-pan-y footer-model-ready:pointer-events-auto footer-model-ready:cursor-grab footer-model-ready:active:cursor-grabbing"
        >
          {/* Contact shadow on the rock */}
          <span
            aria-hidden="true"
            className="absolute inset-x-[-12%] -bottom-[3%] h-[7%] bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--color-ink)_55%,transparent),transparent)] blur-[2px]"
          />
          <Image
            src="/images/home/footer-stick.png"
            alt="The SAVA Balanced stick standing on a rock ledge"
            fill
            sizes="(min-width: 64rem) 12vw, 30vw"
            className="object-contain object-bottom footer-model-ready:invisible"
          />
        </div>
      </div>
    </footer>
  );
}
