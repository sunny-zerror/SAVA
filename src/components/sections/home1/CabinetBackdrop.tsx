/**
 * The sky-blue SAVA field that /home1 opens onto: one screen of it, held in place (sticky) behind the
 * cabinet hero and the bestsellers after it. The hero's room covers it until the scroll scene fades the
 * room away (CabinetScroll); from then on it doesn't move, so the hero's last frame and the bestsellers
 * scrolling up in front of it share one unbroken blue. Over the brand gradient a deeper blue wells up
 * from the bottom left (so white type reads), white light from the top right and a softer white haze
 * from the bottom right, each slowly swelling and settling from its corner, under the grain.
 */
export default function CabinetBackdrop({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mt-header">
      <div
        aria-hidden="true"
        className="pointer-events-none sticky top-0 -mb-[100svh] h-svh overflow-hidden bg-accent bg-gradient-brand"
      >
        <div className="absolute inset-0 origin-bottom-left bg-radial-[ellipse_70%_70%_at_0%_100%] from-navy/30 to-transparent motion-safe:animate-glow-breathe" />
        <div className="absolute inset-0 origin-top-right bg-radial-[ellipse_65%_60%_at_100%_0%] from-paper/60 via-mist/25 to-transparent motion-safe:animate-glow-breathe motion-safe:[animation-direction:alternate-reverse]" />
        <div className="absolute inset-0 origin-bottom-right bg-radial-[ellipse_55%_45%_at_85%_100%] from-paper/35 to-transparent motion-safe:animate-glow-breathe" />
        <div className="absolute inset-0 bg-grain opacity-15 mix-blend-overlay" />
      </div>
      {children}
    </div>
  );
}
