import CroppedImage from "@/components/ui/CroppedImage";
import { cn } from "@/utils/cn";

/** The SAVA stick cropped tight — the small product chip in the comparison table and review cards */
export default function StickThumb({ className }: { className?: string }) {
  return (
    <CroppedImage
      src="/images/home/hero-stick.png"
      width={1122}
      height={1402}
      crop={{ width: 191.58, height: 123.44, left: -45.79, top: -10.94 }}
      sizes="80px"
      className={cn("h-16 w-8.5", className)}
    />
  );
}
