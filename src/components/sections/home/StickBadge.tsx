import { cn } from "@/utils/cn";

/** Slowly turning "sweat and odor defense · action" ring around the SAVA drop */
export default function StickBadge({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn("relative grid size-21 shrink-0 place-items-center", className)}>
      <svg viewBox="0 0 84 84" className="absolute inset-0 size-full animate-spin-slow fill-current">
        <defs>
          <path id="stick-badge-ring" d="M42 42m-34 0a34 34 0 1 1 68 0a34 34 0 1 1-68 0" />
        </defs>
        {/* No type role: its size is in the viewBox's units and fitted round the ring by textLength,
            and a role's font-size would override fontSize */}
        <text fontSize="7.5" className="uppercase">
          <textPath href="#stick-badge-ring" textLength="212" lengthAdjust="spacing">
            Sweat and odor defense · action ·
          </textPath>
        </text>
      </svg>
      <span className="size-6.5 bg-mint mask-[url(/icons/home/badge-drop.png)] mask-contain mask-center mask-no-repeat" />
    </span>
  );
}
