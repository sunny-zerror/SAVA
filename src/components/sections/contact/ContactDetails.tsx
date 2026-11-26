import { RiMailLine, RiMapPin2Line, RiPhoneLine, RiTimeLine, type RemixiconComponentType } from "@remixicon/react";
import SocialLinks from "@/components/ui/SocialLinks";
import Sparkle from "@/components/ui/Sparkle";
import { siteConfig } from "@/config/site";

interface Row {
  label: string;
  value: string;
  href?: string;
  Icon: RemixiconComponentType;
}

/** Lists whichever contact details are filled in src/config/site.ts, then the social links */
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

      {/* The social links in a row, as at the foot of the menu */}
      <div data-reveal className="flex flex-col gap-4">
        <p className="flex items-center gap-2 text-kicker text-accent">
          <Sparkle />
          Follow {siteConfig.name}
        </p>
        <SocialLinks />
      </div>
    </div>
  );
}
