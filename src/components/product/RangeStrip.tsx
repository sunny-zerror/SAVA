import Image from "next/image";
import Link from "next/link";
import { stickRange } from "@/config/shop";
import { cn } from "@/utils/cn";
import { productHref } from "@/utils/url";

interface RangeStripProps {
  /** Called when a tile is chosen — e.g. to close the drawer it sits in */
  onSelect?: () => void;
  className?: string;
  /** Sizing for each photo tile (a height or aspect ratio) */
  tileClassName?: string;
}

/** The three SAVA sticks as photo tiles linking to their product pages (the menu, the empty bag) */
export default function RangeStrip({ onSelect, className, tileClassName }: RangeStripProps) {
  return (
    <ul className={cn("grid grid-cols-3 gap-3", className)}>
      {stickRange.map((stick) => (
        <li key={stick.slug}>
          <Link href={productHref(stick.slug)} onClick={onSelect} className="group flex h-full flex-col gap-2">
            <span className={cn("relative block overflow-hidden rounded-2xl bg-surface", tileClassName)}>
              {/* The photos' white ground multiplies away into the tile */}
              <Image
                src={`/images/products/${stick.slug}.jpg`}
                alt=""
                fill
                sizes="10rem"
                className="object-contain p-2 mix-blend-multiply transition-transform duration-700 ease-out-expo group-hover:scale-105"
              />
            </span>
            <span className="text-h6 transition-colors group-hover:text-accent">{stick.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
