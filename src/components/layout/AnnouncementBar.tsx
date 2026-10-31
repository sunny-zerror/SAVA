import Sparkle from "@/components/ui/Sparkle";
import { cn } from "@/utils/cn";

const messages = [
  "ISO-22716 Certified",
  "Advanced sweat control, refined fragrance, and 30-day returns",
  "Formula T-O Space // Lot-T25-V2",
];

/**
 * Thin brand strip above the header — the middle message only on small screens. Absolute, so it
 * takes no room in the flow: the header leaves space for it (mt-announcement) and the home hero runs
 * up underneath it.
 */
export default function AnnouncementBar() {
  return (
    // data-site-announcement: the home intro drops it in ahead of the header
    <div
      data-site-announcement
      // Anchored above the page during route fades (globals.css, "Page transitions")
      className="absolute inset-x-0 top-0 z-50 bg-accent text-paper [view-transition-class:site-chrome] [view-transition-name:site-announcement]"
    >
      <ul className="container flex h-announcement items-center justify-center text-center text-eyebrow lg:justify-between">
        {messages.map((message, i) => (
          <li key={message} className={cn("flex items-center gap-1.5", i !== 1 && "max-lg:hidden")}>
            <Sparkle />
            {message}
          </li>
        ))}
      </ul>
    </div>
  );
}
