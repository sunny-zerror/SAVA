import Link from "next/link";
import Logo from "@/components/layout/Logo";
import { footerNav } from "@/config/navigation";
import { siteConfig } from "@/config/site";

export default function Footer() {
  const socials = Object.entries(siteConfig.socials).filter(([, url]) => url);

  return (
    <footer className="mt-section border-t border-line">
      <div className="container grid gap-stack py-section md:grid-cols-[2fr_repeat(3,1fr)]">
        <div className="flex max-w-xs flex-col gap-4">
          <Logo />
          <p className="text-caption text-muted">{siteConfig.tagline}</p>
          {siteConfig.contact.email && (
            <a href={`mailto:${siteConfig.contact.email}`} className="text-caption hover:underline">
              {siteConfig.contact.email}
            </a>
          )}
        </div>

        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="mb-4 font-secondary text-eyebrow text-muted">{group.title}</h2>
            <ul className="flex flex-col gap-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-caption hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="container flex flex-col gap-4 border-t border-line py-6 text-caption text-muted md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.
        </p>
        {socials.length > 0 && (
          <ul className="flex gap-6">
            {socials.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer" className="capitalize hover:text-ink">
                  {name}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
