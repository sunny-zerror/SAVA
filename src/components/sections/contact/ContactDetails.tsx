import { RiMailLine, RiMapPin2Line, RiPhoneLine, RiTimeLine, type RemixiconComponentType } from "@remixicon/react";
import BlobButton from "@/components/ui/BlobButton";
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
        <dl data-reveal="stagger" className="flex flex-col gap-6">
          {rows.map(({ label, value, href, Icon }) => (
            <div key={label} className="flex items-center gap-4">
              <span aria-hidden="true" className="center size-12 shrink-0 rounded-full bg-surface text-accent">
                <Icon className="size-5" />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <dt className="text-caption text-muted">{label}</dt>
                <dd className="text-h5 wrap-break-word">
                  {href ? (
                    <a href={href} className="link-underline transition-colors hover:text-accent">
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
      <div data-reveal className="relative isolate overflow-hidden rounded-3xl bg-gradient-light p-6 text-paper md:p-8">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-grain opacity-20 mix-blend-overlay" />
        <p className="flex items-center gap-2 text-kicker">
          <Sparkle />
          {siteConfig.name} Club
        </p>
        <p className="mt-3 max-w-xs text-h3">Follow along for drops, routines and stories</p>
        {/* gap-x-16 leaves room for each button's hover disc */}
        <ul aria-label="Social" className="mt-6 flex flex-wrap gap-x-16 gap-y-3">
          {socialNav.map((item) => (
            <li key={item.label}>
              <BlobButton href={item.href} target="_blank" rel="noopener noreferrer" tone="light">
                {item.label}
              </BlobButton>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
