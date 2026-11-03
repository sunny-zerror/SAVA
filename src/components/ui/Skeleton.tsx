import { cn } from "@/utils/cn";

/** Shimmering placeholder block — give it a size and a radius (rounded-full for text lines, rounded-3xl for cards) */
export default function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("skeleton block", className)} />;
}

/**
 * A placeholder line of text in a type role. The zero-width space gives the line the role's own
 * height, so the skeleton takes the same room as the text it stands for.
 */
export function SkeletonLine({ role, center, className }: { role: string; center?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center", center && "justify-center", role)}>
      <span className="w-0">{"​"}</span>
      <Skeleton className={cn("h-[0.7em] rounded-full", className)} />
    </span>
  );
}
