import { RiInstagramLine, RiLinkedinLine, RiTwitterXLine } from "@remixicon/react";
import { socialNav } from "@/config/navigation";
import { cn } from "@/utils/cn";

/** An icon for each social link, by label (socialNav) */
const socialIcons: Record<string, typeof RiInstagramLine> = {
  Instagram: RiInstagramLine,
  Linkedin: RiLinkedinLine,
  "X (Twitter)": RiTwitterXLine,
};

interface SocialLinksProps {
  className?: string;
  /** Each link fades up with a drawer's content (data-drawer-extra, useDrawerMotion) */
  drawerExtra?: boolean;
}

/** The social links in a row: round outlined icons that fill with ink on hover (the menu, the contact page) */
export default function SocialLinks({ className, drawerExtra }: SocialLinksProps) {
  return (
    <ul aria-label="Social" className={cn("flex items-center gap-3", className)}>
      {socialNav.map((item) => {
        const Icon = socialIcons[item.label];
        return (
          <li key={item.label} data-drawer-extra={drawerExtra || undefined}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.label}
              className="center size-11 rounded-full border border-line transition-colors duration-300 hover:border-ink hover:bg-ink hover:text-paper"
            >
              {Icon ? <Icon aria-hidden="true" className="size-4.5" /> : item.label}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
