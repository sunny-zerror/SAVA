import { cn } from "@/utils/cn";

/** Shimmering placeholder block — give it a size and a radius (rounded-full for text lines, rounded-3xl for cards) */
export default function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn("skeleton block", className)} />;
}
