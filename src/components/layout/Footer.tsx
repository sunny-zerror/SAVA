import Image from "next/image";
import Link from "next/link";
import StickBadge from "@/components/sections/home/StickBadge";
import { Frame, FrameRule } from "@/components/ui/Frame";
import { footerNav, legalNav, socialNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/cn";
import FooterDroplets from "./FooterDroplets";
import FooterGlow from "./FooterGlow";

// The legal links line up under the columns above; the last one ends at the right rail
const LEGAL_COLUMNS = ["lg:col-start-7", "lg:col-start-9", "lg:col-start-11 lg:justify-self-end"];

export default function Footer() {
  const { email } = siteConfig.contact;
  const { street, city, state, postalCode } = siteConfig.address;
  const address = [street, city, [state, postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <footer data-droplets-host className="relative isolate overflow-hidden bg-night text-paper">
      {/* Skin, close up: the image stands in until the live version over it is drawn */}
      <Image src="/images/footer/bg_skin_texture.png" alt="" fill sizes="100vw" className="-z-10 object-cover" />
      {/* Skin and sweat dimmed, and at full brightness around the pointer */}
      <FooterGlow className="absolute inset-0 -z-10">
        {/* Sweat beads, running down when the pointer passes */}
        <FooterDroplets density={2} strength={1.8} className="absolute inset-0 size-full" />
      </FooterGlow>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-15 mix-blend-overlay" />

      {/* A screen tall, less the header */}
      <Frame tone="dark" className="flex min-h-[calc(100svh-var(--spacing-header))] flex-col">
        <FrameRule tone="dark" />

        <div className="grid gap-10 px-inset pt-12 pb-10 md:pt-16 lg:grid-cols-12">
          <p data-reveal className="max-w-md text-body-lg lg:col-span-4">
            SAVA brings together advanced sweat-control technology and refined fragrance to create a new standard in
            everyday personal care.
          </p>

          <nav aria-label="Footer" className="lg:col-span-2 lg:col-start-7">
            <p className="text-body font-medium">Menu</p>
            <ul data-reveal="stagger" className="mt-4 flex flex-col gap-2.5">
              {footerNav.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="link-underline text-h5">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-4 lg:col-start-9">
            <nav aria-label="Social">
              <p className="text-body font-medium">Sava Club</p>
              <ul data-reveal="stagger" className="mt-4 flex flex-col gap-2 text-caption">
                {socialNav.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} target="_blank" rel="noopener noreferrer" className="link-underline">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <address data-reveal="stagger" className="mt-8 flex flex-col gap-2 text-body font-medium not-italic">
              {email && (
                <a href={`mailto:${email}`} className="w-fit link-underline">
                  {email}
                </a>
              )}
              {address && <p>{address}</p>}
            </address>
          </div>
        </div>

        {/* The open skin between the links and the logo */}
        <div className="min-h-16 flex-1" />

        {/* The logo bottom left, in line with the text above it, and the badge across from it */}
        <div className="flex items-center justify-between gap-6 px-inset pb-8 md:pb-10">
          <Link
            href="/"
            aria-label={`${siteConfig.name} — home`}
            data-reveal
            // The header's wordmark, as a mask in the text colour; kept within ~1.5× its 256px source
            className="block aspect-256/49 w-[min(60vw,24rem)] bg-current mask-[url(/images/brand/wordmark.png)] mask-contain mask-left mask-no-repeat"
          />
          <StickBadge className="size-28 shrink-0 text-paper md:size-32" />
        </div>

        <FrameRule tone="dark" />
        <div className="relative z-10 grid grid-cols-2 gap-x-6 gap-y-3 px-inset py-6 text-caption lg:grid-cols-12">
          <p className="lg:col-span-4">ISO-22716 Certified</p>
          {legalNav.map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn("w-fit link-underline lg:col-span-2", LEGAL_COLUMNS[i])}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </Frame>
    </footer>
  );
}
