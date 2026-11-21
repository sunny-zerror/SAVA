import Image from "next/image";
import Link from "next/link";
import StickBadge from "@/components/sections/home/StickBadge";
import { Frame, FrameRule } from "@/components/ui/Frame";
import { footerNav, legalNav, socialNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/utils/cn";
import FooterDroplets from "./FooterDroplets";

// The legal links line up under the columns above; the last one ends at the right rail
const LEGAL_COLUMNS = ["lg:col-start-7", "lg:col-start-9", "lg:col-start-11 lg:justify-self-end"];

export default function Footer() {
  const { email } = siteConfig.contact;
  const { street, city, state, postalCode } = siteConfig.address;
  const address = [street, city, [state, postalCode].filter(Boolean).join(" ")].filter(Boolean).join(", ");

  return (
    <footer className="relative isolate overflow-hidden bg-accent text-paper">
      {/* Soft light pooling across the blue, with grain */}
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-radial from-paper/30 via-paper/10 to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-15 mix-blend-overlay" />
      {/* Sweat beads that run down when the pointer passes */}
      <FooterDroplets className="absolute inset-0 -z-10 size-full" />

      <Frame tone="dark" className="flex flex-col">
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

        {/* Room for the photo, which stands on the footer's bottom edge (behind the last row), and the badge */}
        <div className="relative h-72 md:h-80 lg:h-64">
          <div className="absolute right-(--spacing-inset) bottom-6">
            <StickBadge className="size-28 text-paper md:size-32" />
          </div>
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

        {/* The brand photo, standing on the bottom edge and fading out as it meets it */}
        <div className="pointer-events-none absolute bottom-0 left-(--spacing-inset) w-[clamp(13rem,22vw,20rem)] mask-b-from-75%">
          <Image
            src="/images/newhome/footer_img.png"
            alt="A woman in SAVA blue sportswear holding out a SAVA Balanced stick"
            width={1024}
            height={1280}
            sizes="(min-width: 64rem) 22vw, 13rem"
            className="w-full"
          />
        </div>
      </Frame>
    </footer>
  );
}
