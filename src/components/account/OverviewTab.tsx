import {
  RiArrowRightUpLine,
  RiBox3Line,
  RiMapPin2Line,
  RiUser3Line,
  type RemixiconComponentType,
} from "@remixicon/react";
import Link from "next/link";
import type { User } from "@/types";

const cards: { tab: string; title: string; body: string; Icon: RemixiconComponentType }[] = [
  { tab: "orders", title: "Orders", body: "Track deliveries and download invoices.", Icon: RiBox3Line },
  { tab: "addresses", title: "Addresses", body: "Manage where we deliver.", Icon: RiMapPin2Line },
  { tab: "profile", title: "Profile", body: "Update your details and password.", Icon: RiUser3Line },
];

export default function OverviewTab({ user }: { user: User }) {
  const details = [
    { label: "Name", value: `${user.firstName} ${user.lastName}` },
    { label: "Email", value: user.email },
    user.phoneNumber && { label: "Phone", value: `${user.countryCode ?? ""} ${user.phoneNumber}`.trim() },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="flex flex-col gap-grid">
      <dl className="grid gap-6 rounded-3xl bg-surface p-6 md:grid-cols-3 md:p-8">
        {details.map((row) => (
          <div key={row.label} className="flex min-w-0 flex-col gap-1">
            <dt className="text-caption text-muted">{row.label}</dt>
            <dd className="text-lg font-bold wrap-break-word">{row.value}</dd>
          </div>
        ))}
      </dl>

      <ul className="grid gap-grid md:grid-cols-3">
        {cards.map(({ tab, title, body, Icon }) => (
          <li key={tab}>
            <Link
              href={`/account?tab=${tab}`}
              scroll={false}
              className="group flex h-full flex-col gap-6 rounded-3xl border border-line p-6 transition-colors duration-300 hover:border-accent md:p-8"
            >
              <span className="flex items-center justify-between">
                <span aria-hidden="true" className="center size-12 rounded-full bg-gradient-badge text-paper">
                  <Icon className="size-5" />
                </span>
                <RiArrowRightUpLine
                  aria-hidden="true"
                  className="size-5 text-muted transition-transform duration-300 ease-out-expo group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent"
                />
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-primary text-2xl font-bold">{title}</span>
                <span className="text-caption text-muted">{body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
