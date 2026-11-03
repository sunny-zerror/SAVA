"use client";

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Asset } from "@/types";
import { cn } from "@/utils/cn";
import { mediaUrl, productImages } from "@/utils/media";

interface ProductGalleryProps {
  assets: Asset[];
  name: string;
  /** The product's ribbon, as a badge over the photo */
  ribbon?: string | null;
}

/** Horizontal travel (px) that counts as a swipe */
const SWIPE = 40;

/** As on the related-products carousel: plain outlines that fill with SAVA blue on hover (the gallery wraps round, so neither ever stops) */
const arrow =
  "absolute top-1/2 z-10 center size-9 -translate-y-1/2 rounded-full border border-line bg-paper text-muted transition-colors duration-300 hover:border-accent hover:bg-accent hover:text-paper";

/**
 * The product's photos: a column of thumbnails beside the photo, as tall as it and scrolling when
 * there are more (a scrolling row under it on phones), and the arrows — or a swipe — to step through.
 * The photos are stacked and cross-fade, so switching never waits on a download. Packshots are wide
 * with the stick centred: cover trims the empty sides, and multiply gives their white backdrop the
 * box's tint.
 */
export default function ProductGallery({ assets, name, ribbon }: ProductGalleryProps) {
  const images = productImages(assets);
  const list = images.length ? images : [{ path: "", altText: name }];
  const [active, setActive] = useState(0);
  const swipeFrom = useRef<number | null>(null);
  const thumbs = useRef<HTMLUListElement>(null);

  const step = (by: number) => setActive((i) => (i + by + list.length) % list.length);

  // Keep the active thumbnail in view, scrolling only the strip (never the page)
  useEffect(() => {
    const strip = thumbs.current;
    const thumb = strip?.children[active];
    if (!strip || !(thumb instanceof HTMLElement)) return;
    strip.scrollTo({
      top: thumb.offsetTop - (strip.clientHeight - thumb.offsetHeight) / 2,
      left: thumb.offsetLeft - (strip.clientWidth - thumb.offsetWidth) / 2,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }, [active]);

  return (
    <div className="flex flex-col gap-4 md:flex-row-reverse">
      {/* data-reveal="fade": the photo fades in as the page comes in — images only ever fade */}
      <div
        data-reveal="fade"
        className="relative aspect-square w-full touch-pan-y overflow-hidden rounded-2xl bg-surface md:flex-1"
        onPointerDown={(event) => (swipeFrom.current = event.clientX)}
        onPointerUp={(event) => {
          const dx = swipeFrom.current === null ? 0 : event.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(dx) > SWIPE) step(dx < 0 ? 1 : -1);
        }}
      >
        {list.map((image, i) => (
          // Switching cross-fades. The blend sits on this wrapper: its opacity isolates whatever's
          // inside, which would then multiply with nothing instead of the box's tint
          <span
            key={`${image.path}-${i}`}
            aria-hidden={i !== active || undefined}
            className={cn(
              "absolute inset-0 mix-blend-multiply transition-opacity duration-700 ease-out-expo",
              i === active ? "opacity-100" : "opacity-0",
            )}
          >
            <Image
              src={mediaUrl(image.path)}
              alt={image.altText || `${name}, image ${i + 1}`}
              fill
              priority={i === 0}
              draggable={false}
              sizes="(min-width: 64rem) 40vw, (min-width: 48rem) 75vw, 100vw"
              className="object-cover"
            />
          </span>
        ))}

        {ribbon && (
          <span className="absolute top-4 left-4 z-10 rounded-full bg-mint px-3 py-1 text-micro font-medium">
            {ribbon}
          </span>
        )}

        {list.length > 1 && (
          <>
            <button type="button" aria-label="Previous image" onClick={() => step(-1)} className={cn(arrow, "left-4")}>
              <RiArrowLeftSLine className="size-4" />
            </button>
            <button type="button" aria-label="Next image" onClick={() => step(1)} className={cn(arrow, "right-4")}>
              <RiArrowRightSLine className="size-4" />
            </button>
          </>
        )}
      </div>

      {list.length > 1 && (
        // md+: the column takes the photo's height (the strip is out of flow) and the strip scrolls in it.
        // -m-1 p-1: room inside the scroll area for the focus ring
        <div className="relative md:w-20 md:shrink-0 lg:w-24">
          {/* The thumbnails fade in with the photo */}
          <ul
            ref={thumbs}
            data-lenis-prevent
            data-reveal="fade"
            className="relative -m-1 no-scrollbar flex gap-3 overflow-x-auto p-1 md:absolute md:inset-0 md:flex-col md:overflow-x-hidden md:overflow-y-auto"
          >
            {list.map((image, i) => (
              <li key={`${image.path}-${i}`} className="w-[22%] shrink-0 md:w-full">
                <button
                  type="button"
                  aria-label={`Show image ${i + 1} of ${list.length}`}
                  aria-current={i === active || undefined}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative block aspect-square w-full overflow-hidden rounded-xl border bg-surface transition-colors",
                    i === active ? "border-accent" : "border-transparent hover:border-line",
                  )}
                >
                  <Image
                    src={mediaUrl(image.path)}
                    alt=""
                    fill
                    sizes="6rem"
                    draggable={false}
                    className="object-cover mix-blend-multiply"
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
