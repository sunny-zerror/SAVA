import Image from "next/image";
import { Frame, FrameRule } from "@/components/ui/Frame";
import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn";

/**
 * A placeholder line of text in a type role. The zero-width space gives the line the role's own
 * height, so the skeleton takes the same room as the text it stands for.
 */
function Line({ role, center, className }: { role: string; center?: boolean; className?: string }) {
  return (
    <span className={cn("flex items-center", center && "justify-center", role)}>
      <span className="w-0">{"​"}</span>
      <Skeleton className={cn("h-[0.7em] rounded-full", className)} />
    </span>
  );
}

/** The shop hero's layout (ShopHero): the headline's two lines and the button; the artwork itself */
function HeroSkeleton() {
  return (
    <div className="overflow-hidden bg-surface">
      <Frame className="grid items-center gap-10 px-inset py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-6 lg:py-10">
        {/* Mist-tinted: the default skeleton fill is the same surface colour as the hero */}
        <div className="flex flex-col items-start gap-8">
          <div className="w-full max-w-xl">
            <Line role="text-h1" className="w-11/12 bg-mist/50" />
            <Line role="text-h1" className="w-3/5 bg-mist/50" />
          </div>
          <Skeleton className="h-12 w-38 rounded-full bg-mist/50" />
        </div>
        {/* The real still life (the hero preloads it anyway); the sticks drop in once it's live */}
        <div className="relative bleed-r aspect-1672/941">
          <Image
            src="/images/banners/shop-still-life.png"
            alt=""
            fill
            priority
            sizes="(min-width: 64rem) 65vw, 100vw"
            className="object-contain"
          />
        </div>
      </Frame>
    </div>
  );
}

/** A listing cell (ShopProductCard): name, product, price, Buy It Now */
function CardSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4 bg-paper px-5 pt-6 pb-5 md:px-7">
      <Line role="text-h5" center className="w-32" />
      <Skeleton className="aspect-square w-full max-w-60 rounded-3xl" />
      <Line role="text-body-lg" center className="w-16" />
      <Skeleton className="mt-auto h-12 w-full rounded-full" />
    </div>
  );
}

/** The filter sidebar (ShopFilters): title, then the groups — Range open with its options */
function FiltersSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-line pb-5">
        <Line role="text-h4" className="w-20" />
      </div>
      {[true, false, false].map((open, i) => (
        <div key={i} className="border-b border-line py-5">
          <div className="flex items-center justify-between">
            <Line role="text-h6" className="w-24" />
            <Skeleton className="size-4 rounded-full" />
          </div>
          {open && (
            <div className="flex flex-col gap-2 pt-4">
              <Line role="text-caption" className="w-8" />
              <Line role="text-caption" className="w-40" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * The shop listing while it loads, laid out exactly like the page: the hero on the plain first page
 * (`hero`), otherwise the breadcrumbs and title; then the framed grid with its filter column.
 */
export default function ShopSkeleton({ hero }: { hero: boolean }) {
  return (
    <div aria-busy="true" aria-label="Loading products">
      {hero ? (
        <HeroSkeleton />
      ) : (
        <Frame className="flex flex-col gap-6 px-inset pt-section pb-stack">
          <Line role="text-caption" className="w-28" />
          <Line role="text-h1" className="w-72 max-w-full" />
        </Frame>
      )}

      <Frame className="pb-section">
        <FrameRule />
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,3.3fr)]">
          <div className="px-inset py-8 max-lg:border-b max-lg:border-line lg:border-r lg:border-line">
            <FiltersSkeleton />
          </div>
          {/* gap-px over a line-coloured ground: the grid's hairlines */}
          <div className="grid grid-cols-2 gap-px bg-line md:grid-cols-3">
            {Array.from({ length: 6 }, (_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
        <FrameRule />
      </Frame>
    </div>
  );
}
