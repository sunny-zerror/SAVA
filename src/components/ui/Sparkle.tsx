import { cn } from "@/utils/cn";

/** The four-point SAVA star used in labels and lists — takes the current text colour */
export default function Sparkle({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-3 shrink-0 bg-current mask-[url(/icons/sparkle.svg)] mask-contain mask-center mask-no-repeat",
        className,
      )}
    />
  );
}
