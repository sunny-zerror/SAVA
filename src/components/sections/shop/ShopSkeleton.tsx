import { Frame, FrameRule } from "@/components/ui/Frame";
import Skeleton, { SkeletonLine as Line } from "@/components/ui/Skeleton";

/** The shop hero's layout (ShopHero): the dark 22:9 banner, rails running top to bottom */
function HeroSkeleton() {
  return (
    <div className="grid aspect-22/9 overflow-hidden bg-gray-100">
      <Frame tone="dark" className="h-full">
        {null}
      </Frame>
    </div>
  );
}

/** A listing cell (ShopProductCard): photo, name and scent, then price and Add To Cart over a rule */
function CardSkeleton() {
  return (
    <div className="flex flex-col gap-5 bg-paper p-5 md:p-6">
      <Skeleton className="aspect-4/5 w-full rounded-2xl" />
      <div className="flex flex-col items-center gap-1">
        <Line role="text-h5" className="w-32" />
        <Line role="text-body" className="w-24" />
      </div>
      <div className="@container mt-auto border-t border-line pt-4">
        <div className="flex flex-col gap-3 @[18.25rem]:flex-row @[18.25rem]:items-center">
          <Line role="text-body" className="w-20" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
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
        <>
          <HeroSkeleton />
          <Frame className="pt-section">{null}</Frame>
        </>
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
