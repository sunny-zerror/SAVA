import Image from "next/image";
import { cn } from "@/utils/cn";

interface CroppedImageProps {
  src: string;
  alt?: string;
  /** Intrinsic size of the source file */
  width: number;
  height: number;
  /** The image's size and offset relative to the box, in % — e.g. one region of a sprite */
  crop: { width: number; height: number; left: number; top: number };
  /** Rendered width of the whole image, for next/image */
  sizes: string;
  /** Sets the visible box's size */
  className?: string;
}

/** Shows one region of a larger image inside a fixed box */
export default function CroppedImage({ src, alt = "", width, height, crop, sizes, className }: CroppedImageProps) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        className="absolute max-w-none"
        style={{ width: `${crop.width}%`, height: `${crop.height}%`, left: `${crop.left}%`, top: `${crop.top}%` }}
      />
    </span>
  );
}
