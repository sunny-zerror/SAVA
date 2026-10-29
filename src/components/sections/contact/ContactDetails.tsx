import { siteConfig } from "@/config/site";

/** Lists whichever contact details are filled in src/config/site.ts */
export default function ContactDetails() {
  const { contact, address } = siteConfig;
  const addressLine = [address.street, address.city, address.state, address.postalCode].filter(Boolean).join(", ");
  const rows = [
    contact.email && { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    contact.phone && { label: "Phone", value: contact.phone, href: `tel:${contact.phone.replace(/\s+/g, "")}` },
    contact.hours && { label: "Hours", value: contact.hours },
    addressLine && { label: "Studio", value: addressLine },
  ].filter(Boolean) as { label: string; value: string; href?: string }[];

  return (
    <div className="flex flex-col gap-8">
      <p className="text-body text-muted">
        Questions about an order, sizing or delivery? Send us a message and we&apos;ll reply within one working day.
      </p>
      {rows.length > 0 ? (
        <dl className="flex flex-col gap-6">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-1">
              <dt className="text-eyebrow text-muted">{row.label}</dt>
              <dd className="text-body">
                {row.href ? (
                  <a href={row.href} className="hover:underline">
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        process.env.NODE_ENV === "development" && (
          <p className="border border-dashed border-line p-4 text-caption text-muted">
            Add email, phone, hours and address in src/config/site.ts — they&apos;ll appear here.
          </p>
        )
      )}
    </div>
  );
}
