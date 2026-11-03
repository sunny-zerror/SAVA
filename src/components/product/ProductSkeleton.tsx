import { Frame, FrameRule } from "@/components/ui/Frame";
import Skeleton, { SkeletonLine as Line } from "@/components/ui/Skeleton";

/**
 * The product page while it loads, laid out like its hero (src/app/shop/[slug]/page.tsx): the
 * breadcrumbs, then the gallery — thumbnails beside the photo, under it on phones — and the details:
 * name and size pills, tagline and rating, price, pack cards, the two buttons, the highlight rows and
 * the accordion.
 */
export default function ProductSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading product">
      <Frame>
        <div className="px-inset pt-8 pb-6">
          <Line role="text-caption" className="w-48" />
        </div>
        <FrameRule />
        <div className="grid gap-stack px-inset py-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-16 lg:py-14">
          {/* Built like ProductGallery: the photo sets the row's height, the thumbnail column (out of
              flow from md) fills it */}
          <div className="flex flex-col gap-4 md:flex-row-reverse">
            {/* overflow-hidden, as on the gallery's photo: it lets the box shrink beside the column */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:flex-1">
              <Skeleton className="absolute inset-0" />
            </div>
            <div className="relative md:w-20 md:shrink-0 lg:w-24">
              <div className="grid grid-cols-4 gap-3 md:absolute md:inset-0 md:flex md:flex-col md:overflow-hidden">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="aspect-square w-full shrink-0 rounded-xl max-md:last:hidden" />
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex flex-col gap-2 pb-6">
              <div className="flex items-start justify-between gap-4">
                <Line role="text-h3" className="w-56 max-w-full" />
                <div className="flex shrink-0 gap-1.5 pt-1">
                  <Skeleton className="h-8 w-16 rounded-full" />
                  <Skeleton className="h-8 w-14 rounded-full" />
                </div>
              </div>
              <Line role="text-body" className="w-64 max-w-full" />
              <Line role="text-caption" className="w-36" />
            </div>

            <div className="border-y border-line py-5">
              <Line role="text-body-lg" className="w-52" />
            </div>

            <div className="flex flex-col gap-6 pt-6">
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Skeleton className="h-11 rounded-full" />
                <Skeleton className="h-11 rounded-full" />
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4 border-t border-line pt-6">
              <Line role="text-caption" className="w-60 max-w-full" />
              <Line role="text-caption" className="w-72 max-w-full" />
            </div>

            <div className="mt-6 flex flex-col border-t border-line">
              {["w-32", "w-40", "w-24"].map((width) => (
                <div key={width} className="flex items-center justify-between border-b border-line py-5">
                  <Line role="text-h6" className={width} />
                  <Skeleton className="size-4 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <FrameRule />
      </Frame>
    </div>
  );
}
