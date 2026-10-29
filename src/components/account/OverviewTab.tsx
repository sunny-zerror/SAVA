import Link from "next/link";
import type { User } from "@/types";

const cards = [
  { tab: "orders", title: "Orders", body: "Track deliveries and download invoices." },
  { tab: "addresses", title: "Addresses", body: "Manage where we deliver." },
  { tab: "profile", title: "Profile", body: "Update your details and password." },
];

export default function OverviewTab({ user }: { user: User }) {
  return (
    <div className="flex flex-col gap-stack">
      <dl className="grid gap-6 text-caption md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <dt className="text-eyebrow text-muted">Name</dt>
          <dd>
            {user.firstName} {user.lastName}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-eyebrow text-muted">Email</dt>
          <dd>{user.email}</dd>
        </div>
        {user.phoneNumber && (
          <div className="flex flex-col gap-1">
            <dt className="text-eyebrow text-muted">Phone</dt>
            <dd>
              {user.countryCode} {user.phoneNumber}
            </dd>
          </div>
        )}
      </dl>

      <ul className="grid gap-grid md:grid-cols-3">
        {cards.map((card) => (
          <li key={card.tab}>
            <Link
              href={`/account?tab=${card.tab}`}
              scroll={false}
              className="flex h-full flex-col gap-2 border border-line p-6 transition-colors hover:border-ink"
            >
              <span className="font-primary text-2xl">{card.title}</span>
              <span className="text-caption text-muted">{card.body}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
