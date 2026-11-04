import Sparkle from "@/components/ui/Sparkle";
import { cn } from "@/utils/cn";
import AnnouncementMotion from "./AnnouncementMotion";

const messages = [
  "ISO-22716 Certified",
  "Advanced sweat control, refined fragrance, and 30-day returns",
  "Formula T-O Space // Lot-T25-V2",
];

/**
 * Thin brand strip above the header. Below lg the three messages share one slot and take turns
 * (AnnouncementMotion); with reduced motion only the middle one shows there. Absolute, so it
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
      {/* Below lg: one grid cell they all fill (so a 100% shift is exactly one bar), clipped so they
          rise in and out of the bar. The others start invisible; AnnouncementMotion's inline styles
          take over from there */}
      <AnnouncementMotion className="container grid h-announcement overflow-clip text-center text-eyebrow lg:flex lg:items-center lg:justify-between">
        {messages.map((message, i) => (
          <li
            key={message}
            data-announcement
            className={cn(
              "col-start-1 row-start-1 flex items-center justify-center gap-1.5 text-balance",
              i !== 1 && "max-lg:invisible",
            )}
          >
            <Sparkle />
            {message}
          </li>
        ))}
      </AnnouncementMotion>
    </div>
  );
}
