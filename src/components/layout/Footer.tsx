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

  // Rendered twice: beside the other link columns below lg, next to the address from lg up
  const legalLinks = (
    <ul data-reveal="stagger" className="flex flex-col gap-2.5 text-caption lg:text-body-lg">
      {legalNav.map((item) => (
        <li key={item.label}>
          <Link href={item.href} className="link-underline">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <footer className="relative isolate overflow-hidden bg-navy text-paper">
      {/* Live aurora (bg-navy shows for reduced motion / no WebGL), with grain */}
      <ReviewsCanvas className="absolute inset-0 -z-10 size-full" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-15 mix-blend-overlay" />

      {/* Below lg everything is centred: the heading, three link columns side by side, the address,
          then the watermark last, where the rock and stick overlap it (order-last, -mt on the rock) */}
      <Frame tone="dark" className="flex flex-col pt-12 md:pt-20 lg:block">
        <FrameRule tone="dark" />

        <div className="grid gap-10 px-inset py-10 lg:grid-cols-12">
          <div className="flex flex-col items-center gap-8 text-center lg:col-span-6 lg:items-start lg:text-left">
            <h2 data-heading-effect>
              Clean Ingredients
              <br />
              Health Skin
            </h2>
            <BlobButton href="/shop" tone="light" data-reveal>
              Explore Collection
            </BlobButton>
          </div>

          {/* A row of columns below lg; from lg its columns take their own cells in the grid */}
          <div className="flex justify-between gap-4 lg:contents">
            <nav aria-label="Footer" className="lg:col-span-2 lg:col-start-9">
              <ul data-reveal="stagger" className="flex flex-col gap-2.5 text-body font-medium lg:gap-4 lg:text-h4">
                {footerNav.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="link-underline">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Social" className="lg:col-span-1 lg:col-start-12">
              <ul
                data-reveal="stagger"
                className="flex flex-col gap-2.5 text-caption whitespace-nowrap lg:text-body-lg"
              >
                {socialNav.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Legal" className="lg:hidden">
              {legalLinks}
            </nav>
          </div>
        </div>

        <FrameRule tone="dark" />
        {/* Band for the SAVA watermark: big type, so it only fades in. Below lg it comes last and the
            wordmark sits low, just above the rock's top face, behind the stick */}
        <div aria-hidden="true" data-reveal="fade" className="relative h-56 max-lg:order-last md:h-78">
          <span className="absolute inset-x-[2%] inset-y-[12%] bg-paper/15 mask-[url(/images/brand/wordmark.png)] mask-contain mask-center mask-no-repeat max-lg:top-auto max-lg:bottom-6 max-lg:aspect-256/49" />
        </div>
        <FrameRule tone="dark" className="max-lg:hidden" />

        <div className="grid gap-8 px-inset py-10 lg:grid-cols-12 lg:pt-14 lg:pb-12">
          <nav aria-label="Legal" className="max-lg:hidden lg:col-span-2 lg:col-start-7">
            {legalLinks}
          </nav>

          <address
            data-reveal="stagger"
            className="flex flex-col items-center gap-5 text-center text-body font-medium not-italic lg:col-span-4 lg:col-start-9 lg:items-start lg:text-left lg:text-h5"
          >
            {/* The link wraps only the address, so its underline runs under the text, not the sparkle.
                Below lg the sparkle sits above its line */}
            {email && (
              <p className="flex flex-col items-center gap-2 lg:flex-row lg:gap-4">
                <Sparkle className="size-4.5" />
                <a href={`mailto:${email}`} className="link-underline">
                  {email}
                </a>
              </p>
            )}
            {address && (
              <p className="flex flex-col items-center gap-2 lg:flex-row lg:gap-4">
                <Sparkle className="size-4.5" />
                {address}
              </p>
            )}
          </address>
        </div>
      </Frame>

      {/*
        The rock ledge, flush with the bottom-left corner (in flow below the content on small screens,
        pulled up over the watermark band so the wordmark shows just above its top face).
        The SAVA stick stands on it: FooterModel drops its 3D stick into this slot as the footer
        scrolls in, landing as the footer bottoms out; for reduced motion / no WebGL, the static one.
        z-30 keeps it in front of the frame's rail pulses (z-20), which run down behind it.
      */}
      <div className="relative z-30 w-[min(70vw,24rem)] max-lg:-mt-16 lg:absolute lg:bottom-0 lg:left-0 lg:w-[clamp(15rem,30vw,27rem)]">
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
