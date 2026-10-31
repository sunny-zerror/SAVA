import { RiMailLine, RiMapPin2Line, RiPhoneLine, RiTimeLine, type RemixiconComponentType } from "@remixicon/react";
import Image from "next/image";
import Sparkle from "@/components/ui/Sparkle";
import { socialNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

interface Row {
  label: string;
  value: string;
  href?: string;
  Icon: RemixiconComponentType;
}

/** Lists whichever contact details are filled in src/config/site.ts, then a social card */
export default function ContactDetails() {
  const { contact, address } = siteConfig;
  const addressLine = [address.street, address.city, address.state, address.postalCode].filter(Boolean).join(", ");
  const rows = [
    contact.email && { label: "Email", value: contact.email, href: `mailto:${contact.email}`, Icon: RiMailLine },
    contact.phone && {
      label: "Phone",
      value: contact.phone,
      href: `tel:${contact.phone.replace(/\s+/g, "")}`,
      Icon: RiPhoneLine,
    },
    contact.hours && { label: "Hours", value: contact.hours, Icon: RiTimeLine },
    addressLine && { label: "Studio", value: addressLine, Icon: RiMapPin2Line },
  ].filter(Boolean) as Row[];

  return (
    <div className="flex flex-col gap-10">
      {rows.length > 0 ? (
        <dl className="flex flex-col gap-6">
          {rows.map(({ label, value, href, Icon }) => (
            <div key={label} className="flex items-center gap-4">
              <span aria-hidden="true" className="center size-12 shrink-0 rounded-full bg-surface text-accent">
                <Icon className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-caption text-muted">{label}</dt>
                <dd className="text-h5 wrap-break-word">
                  {href ? (
                    <a href={href} className="transition-colors hover:text-accent">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            </div>
          ))}
        </dl>
      ) : (
        process.env.NODE_ENV === "development" && (
          <p className="rounded-2xl border border-dashed border-line p-4 text-caption text-muted">
            Add email, phone, hours and address in src/config/site.ts — they&apos;ll appear here.
          </p>
        )
      )}

      {/* Social card on the brand gradient */}
      <div className="relative isolate overflow-hidden rounded-3xl bg-navy p-6 text-paper md:p-8">
        <Image
          src="/images/home/hero-bg.png"
          alt=""
          fill
          sizes="(min-width: 64rem) 36vw, 100vw"
          className="-z-10 object-cover"
        />
        <p className="flex items-center gap-2 text-kicker">
          <Sparkle />
          {siteConfig.name} Club
        </p>
        <p className="mt-3 max-w-xs text-h3">Follow along for drops, routines and stories</p>
        <ul aria-label="Social" className="mt-6 flex flex-wrap gap-2">
          {socialNav.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-full border border-paper/40 px-5 text-cta transition-colors hover:bg-paper hover:text-ink"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
