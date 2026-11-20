"use client";

import { RiCloseLine, RiPlayFill } from "@remixicon/react";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";

interface VideoTileProps {
  src: string;
  /** What the film is, for the button and the dialog */
  label: string;
  className?: string;
}

/**
 * The hero's film thumbnail, after the corner tile in the Oryzo reference: a silent loop (desktop
 * only, and still for reduced motion — nothing loads on phones) that opens the film with sound and
 * controls in a modal dialog. The page stops scrolling while it's open; Esc or a click outside closes it.
 */
export default function VideoTile({ src, label, className }: VideoTileProps) {
  const preview = useRef<HTMLVideoElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    const video = preview.current;
    const wide = window.matchMedia("(min-width: 48rem) and (prefers-reduced-motion: no-preference)").matches;
    if (!video || !wide) return;
    video.preload = "auto";
    video.play().catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    lenis?.stop();
    return () => lenis?.start();
  }, [open, lenis]);

  return (
    <>
      {/* The wrapper takes the caller's placement and size; the button fills it */}
      <div className={className}>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Play ${label}`}
          className="group relative isolate size-full overflow-hidden rounded-lg bg-ink ring-1 ring-paper/50 transition-shadow duration-300 hover:ring-paper"
        >
          <video
            ref={preview}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
            className="cover transition-transform duration-700 ease-out-expo group-hover:scale-105"
          />
          <span className="absolute inset-0 center gap-1.5 bg-ink/25 text-kicker text-paper">
            <RiPlayFill className="size-4" aria-hidden="true" />
            Play
          </span>
        </button>
      </div>

      {open && (
        <dialog
          ref={dialog}
          aria-label={label}
          data-lenis-prevent
          onClose={() => setOpen(false)}
          onClick={(event) => event.target === event.currentTarget && dialog.current?.close()}
          className="m-auto w-[min(92vw,80rem)] overflow-visible bg-transparent p-0 backdrop:bg-ink/80 backdrop:backdrop-blur-sm"
        >
          <video src={src} controls autoPlay playsInline className="aspect-video w-full rounded-lg bg-ink" />
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            aria-label="Close the film"
            className="absolute -top-14 right-0 center size-11 rounded-full bg-paper text-ink transition-colors hover:bg-mist"
          >
            <RiCloseLine className="size-5" aria-hidden="true" />
          </button>
        </dialog>
      )}
    </>
  );
}
