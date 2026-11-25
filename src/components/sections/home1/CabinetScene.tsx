"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import CroppedImage from "@/components/ui/CroppedImage";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/utils/cn";
import { productHref } from "@/utils/url";
import {
  CABINET,
  CAMERA,
  DOOR,
  PLANT,
  PRODUCTS,
  SCENE,
  SHOT_SIZE,
  TOWEL,
  place,
  productInfo,
  productRect,
  sceneCrop,
  shotCrop,
  type CabinetProduct,
  type Compartment,
  type Rect,
} from "./cabinet-scene";

/** The scene box's width on screen (CabinetHero sizes it), so every crop of it shares one file */
const SCENE_SIZES = "(min-width: 64rem) calc((100vh - 7.75rem) * 3.27), min(497vw, 2592px)";
/** A whole product shot, of which a stick is about a quarter of the width */
const SHOT_SIZES = "(min-width: 64rem) 16vw, 44vw";

/** Room around the cutouts for them to move into, in the photo's pixels */
const PLANT_ROOM = { l: 24, r: 24, t: 14, b: 0 };
const TOWEL_ROOM = { l: 56, r: 56, t: 0, b: 26 };
const expand = (r: Rect, m: { l: number; r: number; t: number; b: number }): Rect => ({
  x: r.x - m.l,
  y: r.y - m.t,
  w: r.w + m.l + m.r,
  h: r.h + m.t + m.b,
});

const pct = (v: number, of: number) => `${(v / of) * 100}%`;
const smoothstep = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** A door's knob, in the left door's own pixels: painted over on the door's inside */
const KNOB = { x: 242, y: 196, r: 15 };

/**
 * The cabinet from the photo, alive: the doors swing open towards the pointer (left of the cabinet the
 * left door opens, right of it the right one), springing to a stop and bouncing off the frame as they
 * shut; the towel swings and ripples when the pointer brushes past, the plant's leaves bend and rustle.
 * Behind the doors and in the cubby stand the four SAVA sticks, each a link to its product page —
 * keyboard focus on one opens its door. Phones open a door with a tap. With reduced motion everything
 * holds still, both doors open.
 */
export default function CabinetScene() {
  const root = useRef<HTMLDivElement>(null);
  const leftDoor = useRef<HTMLDivElement>(null);
  const rightDoor = useRef<HTMLDivElement>(null);
  const leftShelves = useRef<HTMLDivElement>(null);
  const rightShelves = useRef<HTMLDivElement>(null);
  const plantCanvas = useRef<HTMLCanvasElement>(null);
  const towelCanvas = useRef<HTMLCanvasElement>(null);
  const plantStill = useRef<HTMLImageElement>(null);
  const towelStill = useRef<HTMLImageElement>(null);
  /** The compartment of a product with keyboard focus: its door opens for it */
  const focused = useRef<Compartment | null>(null);

  useGSAP(
    () => {
      const box = root.current;
      const section = box?.closest("section");
      if (!box || !section || !leftDoor.current || !rightDoor.current) return;

      const doors = [
        { el: leftDoor.current, shelves: leftShelves.current, sign: -1, rest: DOOR.rest.left, angle: 0, vel: 0 },
        { el: rightDoor.current, shelves: rightShelves.current, sign: 1, rest: DOOR.rest.right, angle: 0, vel: 0 },
      ].map((d) => ({
        ...d,
        front: d.el.querySelector<HTMLElement>("[data-shade=front]"),
        back: d.el.querySelector<HTMLElement>("[data-shade=back]"),
      }));

      const drawDoor = (d: (typeof doors)[number]) => {
        d.el.style.transform = `rotateY(${d.sign * d.angle}deg)`;
        // The face darkens as it turns from the light; the inside brightens as it comes round to face us
        const turn = Math.sin((Math.min(d.angle, 90) * Math.PI) / 180);
        if (d.front) d.front.style.opacity = String(0.18 * turn);
        if (d.back) d.back.style.opacity = String(0.34 - 0.22 * smoothstep(90, DOOR.max, d.angle));
        // A shut door's sticks can't be clicked through it
        if (d.shelves) d.shelves.toggleAttribute("data-shut", d.angle < 40);
      };

      const mm = gsap.matchMedia();
      mm.add(
        { moving: "(prefers-reduced-motion: no-preference)", still: "(prefers-reduced-motion: reduce)" },
        (context) => {
          const { still } = context.conditions as { moving: boolean; still: boolean };

          if (still) {
            for (const d of doors) {
              d.angle = 100;
              drawDoor(d);
            }
            return;
          }

          // ---- Pointer, in the photo's pixels ------------------------------------------------------
          const pointer = { x: 0, y: 0, active: false, touch: false, seen: false };
          let last = { x: 0, y: 0 };
          /** A tap's push, in place of a pointer's speed */
          let flick = 0;
          const toPhoto = (clientX: number, clientY: number) => {
            const r = box.getBoundingClientRect();
            pointer.x = ((clientX - r.left) / r.width) * SCENE.width - SCENE.x;
            pointer.y = ((clientY - r.top) / r.height) * SCENE.height - SCENE.y;
          };
          const onMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") return;
            toPhoto(e.clientX, e.clientY);
            pointer.active = true;
            pointer.touch = false;
          };
          // A tap opens the door on its side and gives the towel or plant a flick
          const onDown = (e: PointerEvent) => {
            if (e.pointerType !== "touch") return;
            toPhoto(e.clientX, e.clientY);
            pointer.active = true;
            pointer.touch = true;
            flick = 900 * (Math.random() < 0.5 ? -1 : 1);
          };
          const onLeave = (e: PointerEvent) => {
            if (e.pointerType !== "touch") pointer.active = false;
          };
          section.addEventListener("pointermove", onMove);
          section.addEventListener("pointerdown", onDown);
          section.addEventListener("pointerleave", onLeave);

          let visible = true;
          const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
          io.observe(box);

          // ---- Canvases for the towel and the leaves, drawn in strips that each shift sideways --------
          const ink = getComputedStyle(document.documentElement).getPropertyValue("--color-ink").trim() || "#33332e";
          const load = (src: string) => {
            const img = new window.Image();
            img.src = src;
            return img;
          };
          const plantImg = load(PLANT.src);
          const towelImg = load(TOWEL.src);
          const sizeCanvas = (canvas: HTMLCanvasElement | null) => {
            if (!canvas) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
            canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
          };
          const ro = new ResizeObserver(() => {
            sizeCanvas(plantCanvas.current);
            sizeCanvas(towelCanvas.current);
          });
          if (plantCanvas.current) ro.observe(plantCanvas.current);
          if (towelCanvas.current) ro.observe(towelCanvas.current);

          /** Draws `img` (at the photo's scale) in 2px strips, each moved by offset(row) */
          const drawStrips = (
            canvas: HTMLCanvasElement | null,
            img: HTMLImageElement,
            fallback: HTMLImageElement | null,
            cut: Rect,
            room: typeof TOWEL_ROOM,
            offset: (row: number) => number,
            shade?: (row: number) => number,
          ) => {
            const ctx = canvas?.getContext("2d");
            if (!canvas || !ctx || !img.complete || !img.naturalWidth) return;
            const k = canvas.width / (cut.w + room.l + room.r);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const step = 2;
            for (let r = 0; r < cut.h; r += step) {
              const h = Math.min(step, cut.h - r);
              const y0 = Math.round((room.t + r) * k);
              const y1 = Math.round((room.t + r + h) * k);
              ctx.drawImage(img, 0, r, cut.w, h, (room.l + offset(r + h / 2)) * k, y0, cut.w * k, y1 - y0);
            }
            if (shade) {
              // Where the cloth bends it turns from the light
              ctx.globalCompositeOperation = "source-atop";
              ctx.fillStyle = ink;
              for (let r = 0; r < cut.h; r += step) {
                const a = shade(r);
                if (a < 0.01) continue;
                ctx.globalAlpha = a;
                ctx.fillRect(0, Math.round((room.t + r) * k), canvas.width, Math.ceil(step * k));
              }
              ctx.globalAlpha = 1;
              ctx.globalCompositeOperation = "source-over";
            }
            // The canvas has taken over from the still image
            if (fallback && fallback.style.visibility !== "hidden") fallback.style.visibility = "hidden";
          };

          // ---- The towel: a hanging chain of 10 points, pinned at the ring -----------------------------
          const N = 10;
          const tu = new Float64Array(N); // sideways shift, photo px
          const tv = new Float64Array(N);
          const dy = 1 / (N - 1);
          // Each link carries the weight of the cloth below it
          const tension = (j: number) => 1 - (j - 0.5) * dy;
          const towelNodeY = (i: number) => TOWEL.y + TOWEL.pin + (TOWEL.h - TOWEL.pin) * i * dy;
          const towelOffset = (row: number) => {
            if (row <= TOWEL.pin) return 0;
            const f = ((row - TOWEL.pin) / (TOWEL.h - TOWEL.pin)) * (N - 1);
            const i = Math.min(N - 2, Math.floor(f));
            return tu[i] + (tu[i + 1] - tu[i]) * (f - i);
          };
          const towelShade = (row: number) => {
            const slope = Math.abs(towelOffset(row + 6) - towelOffset(row - 6)) / 12;
            return Math.min(0.2, slope * 0.9);
          };

          // ---- The plant: a bend that springs back, and a rustle that dies away ----------------------
          const plant = { x: 0, v: 0, rustle: 0 };
          const plantSpan = PLANT.pivot.y - PLANT.y;
          let time = 0;
          const plantOffset = (row: number) => {
            const d = (PLANT.pivot.y - (PLANT.y + row)) / plantSpan;
            if (d <= 0) return 0;
            return plant.x * d ** 1.4 + plant.rustle * d * Math.sin((PLANT.y + row) * 0.45 + time * 13);
          };

          const tick = (_t: number, deltaMs: number) => {
            // Off screen, or faded out by the scroll scene (CabinetScroll): nothing to draw
            if (!visible || document.hidden || box.style.visibility === "hidden") return;
            const dt = Math.min(deltaMs / 1000, 1 / 20);
            time += dt;

            // Pointer speed across, photo px per second
            let vx = 0;
            if (pointer.active && pointer.seen) vx = Math.max(-2500, Math.min(2500, (pointer.x - last.x) / dt));
            if (pointer.active) {
              last = { x: pointer.x, y: pointer.y };
              pointer.seen = true;
            } else pointer.seen = false;
            // A tap's flick, at whatever it landed near
            if (flick) {
              vx = flick;
              flick = 0;
            }
            const near = (x: number, y: number, reach: number) =>
              pointer.active ? Math.exp(-((pointer.x - x) ** 2 + (pointer.y - y) ** 2) / (2 * reach * reach)) : 0;

            // Doors: towards the pointer's side, else back to rest. A focused stick's door opens for it,
            // and the right door opens to let the hero stick out once the scroll scene sends it off
            const u = (pointer.x - CABINET.centre) / CABINET.halfWidth;
            const leaving = (Number(section.style.getPropertyValue("--stick-move")) || 0) > 0;
            const opened = focused.current ?? (leaving ? "right" : null);
            const targets =
              opened === "left"
                ? [DOOR.open, 0]
                : opened === "right"
                  ? [0, DOOR.open]
                  : pointer.active
                    ? [DOOR.open * smoothstep(0.35, -0.85, u), DOOR.open * smoothstep(-0.35, 0.85, u)]
                    : [DOOR.rest.left, DOOR.rest.right];
            doors.forEach((d, i) => {
              const K = 55;
              const C = 7.5;
              d.vel += (K * (targets[i] - d.angle) - C * d.vel) * dt;
              d.angle += d.vel * dt;
              // Shuts against the frame with a small bounce; stops at its hinge's limit
              if (d.angle < 0) {
                d.angle = 0;
                d.vel = -d.vel * 0.3;
              } else if (d.angle > DOOR.max) {
                d.angle = DOOR.max;
                d.vel = -d.vel * 0.2;
              }
              drawDoor(d);
            });

            // Towel
            const subs = 3;
            const h = dt / subs;
            for (let s = 0; s < subs; s++) {
              for (let i = 1; i < N; i++) {
                const up = tension(i) * (tu[i - 1] - tu[i]);
                const down = i < N - 1 ? tension(i + 1) * (tu[i + 1] - tu[i]) : 0;
                const wind = 0.9 * vx * near(TOWEL.x + TOWEL.w / 2 + tu[i], towelNodeY(i), 140);
                const breeze = 60 * Math.sin(time * 1.1 + i * 0.5) * i * dy;
                tv[i] += ((33 * (up + down)) / (dy * dy) - 1.8 * tv[i] + wind + breeze) * h;
              }
              for (let i = 1; i < N; i++) tu[i] = Math.max(-44, Math.min(44, tu[i] + tv[i] * h));
            }
            drawStrips(towelCanvas.current, towelImg, towelStill.current, TOWEL, TOWEL_ROOM, towelOffset, towelShade);

            // Plant
            const brush = near(PLANT.x + PLANT.w / 2, PLANT.y + PLANT.h / 2, 150);
            plant.v += (-100 * plant.x - 4 * plant.v + 0.7 * vx * brush + 14 * Math.sin(time * 0.8)) * dt;
            plant.x = Math.max(-18, Math.min(18, plant.x + plant.v * dt));
            plant.rustle = Math.min(2.2, plant.rustle * Math.exp(-dt * 2.4) + Math.abs(vx) * brush * 0.0009);
            drawStrips(plantCanvas.current, plantImg, plantStill.current, PLANT, PLANT_ROOM, plantOffset);
          };
          gsap.ticker.add(tick);

          return () => {
            gsap.ticker.remove(tick);
            section.removeEventListener("pointermove", onMove);
            section.removeEventListener("pointerdown", onDown);
            section.removeEventListener("pointerleave", onLeave);
            io.disconnect();
            ro.disconnect();
            if (plantStill.current) plantStill.current.style.visibility = "";
            if (towelStill.current) towelStill.current.style.visibility = "";
          };
        },
      );
    },
    { scope: root },
  );

  const onFocus = (compartment: Compartment) => () => {
    if (compartment !== "cubby") focused.current = compartment;
  };
  const onBlur = () => {
    focused.current = null;
  };

  const shelves = (compartment: Compartment) =>
    PRODUCTS.filter((p) => p.compartment === compartment).map((p, i) => (
      <CabinetStick key={i} product={p} onFocus={onFocus(compartment)} onBlur={onBlur} />
    ));

  return (
    // Sized and placed by CabinetHero's --s (screen px per photo px) and --cx (where the cabinet's middle sits);
    // faded out by the scroll scene (data-cabinet-fade, CabinetScroll)
    <div
      ref={root}
      data-cabinet-fade
      className="absolute bottom-0 left-[calc(var(--cx)-var(--s)*1604)] h-[calc(var(--s)*1841)] w-[calc(var(--s)*3072)]"
    >
      <Image src={SCENE.src} alt="" fill priority sizes={SCENE_SIZES} className="pointer-events-none object-cover" />

      {/* Behind the left door: the right compartment, mirrored */}
      <div aria-hidden="true" className="pointer-events-none absolute" style={place(CABINET.leftDoor)}>
        <CroppedImage
          src={SCENE.src}
          width={SCENE.width}
          height={SCENE.height}
          sizes={SCENE_SIZES}
          crop={sceneCrop(CABINET.rightDoor)}
          className="size-full -scale-x-100"
        />
      </div>

      {/* The sticks — behind the doors they can't be clicked while the door is shut */}
      <div ref={leftShelves} className="pointer-events-none absolute inset-0 data-shut:*:pointer-events-none!">
        {shelves("left")}
      </div>
      <div ref={rightShelves} className="pointer-events-none absolute inset-0 data-shut:*:pointer-events-none!">
        {shelves("right")}
      </div>
      <div className="pointer-events-none absolute inset-0">{shelves("cubby")}</div>

      {/* The upper shelves' front edges, in front of the sticks standing on them */}
      <div aria-hidden="true" className="pointer-events-none absolute" style={place(CABINET.shelfLip)}>
        <CroppedImage
          src={SCENE.src}
          width={SCENE.width}
          height={SCENE.height}
          sizes={SCENE_SIZES}
          crop={sceneCrop(CABINET.shelfLip)}
          className="size-full"
        />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={place({ ...CABINET.shelfLip, x: CABINET.leftDoor.x, w: CABINET.leftDoor.w })}
      >
        <CroppedImage
          src={SCENE.src}
          width={SCENE.width}
          height={SCENE.height}
          sizes={SCENE_SIZES}
          crop={sceneCrop(CABINET.shelfLip)}
          className="size-full -scale-x-100"
        />
      </div>

      {/* The doors, in the photo's own perspective */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          perspective: `calc(var(--s) * ${CAMERA.distance})`,
          perspectiveOrigin: `${pct(CAMERA.x + SCENE.x, SCENE.width)} ${pct(CAMERA.y + SCENE.y, SCENE.height)}`,
        }}
      >
        <Door ref={leftDoor} side="left" />
        <Door ref={rightDoor} side="right" />
      </div>

      {/* The leaves and the towel: still images until their canvases take over */}
      <Image
        ref={plantStill}
        src={PLANT.src}
        alt=""
        width={PLANT.w}
        height={PLANT.h}
        sizes="16vw"
        className="pointer-events-none absolute max-w-none"
        style={place(PLANT)}
      />
      <canvas
        ref={plantCanvas}
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={place(expand(PLANT, PLANT_ROOM))}
      />
      <Image
        ref={towelStill}
        src={TOWEL.src}
        alt=""
        width={TOWEL.w}
        height={TOWEL.h}
        sizes="16vw"
        className="pointer-events-none absolute max-w-none drop-shadow-lg drop-shadow-navy/20"
        style={place(TOWEL)}
      />
      <canvas
        ref={towelCanvas}
        aria-hidden="true"
        className="pointer-events-none absolute drop-shadow-lg drop-shadow-navy/20"
        style={place(expand(TOWEL, TOWEL_ROOM))}
      />
    </div>
  );
}

/**
 * A cabinet door in 3D: the left door's face from the photo on both sides (mirrored for the right
 * door), the inside without its knob, and a painted edge. Turned by CabinetScene about its hinge.
 */
function Door({ side, ref }: { side: "left" | "right"; ref: React.Ref<HTMLDivElement> }) {
  const left = side === "left";
  const rect = left ? CABINET.leftDoor : CABINET.rightDoor;
  const face = (mirror: boolean) => (
    <CroppedImage
      src={SCENE.src}
      width={SCENE.width}
      height={SCENE.height}
      sizes={SCENE_SIZES}
      crop={sceneCrop(CABINET.leftDoor)}
      className={cn("size-full", mirror && "-scale-x-100")}
    />
  );
  const { w, h } = CABINET.leftDoor;
  const knobX = left ? KNOB.x : w - KNOB.x;
  const depth = `calc(var(--s) * ${CABINET.doorDepth})`;

  return (
    <div ref={ref} className={cn("absolute transform-3d", left ? "origin-left" : "origin-right")} style={place(rect)}>
      <div className="absolute inset-0 backface-hidden">
        {face(!left)}
        <span data-shade="front" className="absolute inset-0 bg-ink opacity-0" />
      </div>
      {/* The inside, a door's depth behind the face and turned to look the other way */}
      <div
        className="absolute inset-0 backface-hidden"
        style={{ transform: `translateZ(calc(${depth} * -1)) rotateY(180deg)` }}
      >
        {face(left)}
        <span
          className="absolute rounded-full bg-line blur-[1px]"
          style={{
            left: pct(w - knobX - KNOB.r, w),
            top: pct(KNOB.y - KNOB.r, h),
            width: pct(KNOB.r * 2, w),
            height: pct(KNOB.r * 2, h),
          }}
        />
        <span data-shade="back" className="absolute inset-0 bg-ink opacity-30" />
      </div>
      {/* The free edge */}
      <div
        className={cn(
          "absolute inset-y-0 bg-surface",
          left ? "left-full origin-left rotate-y-90" : "right-full origin-right -rotate-y-90",
        )}
        style={{ width: depth }}
      >
        <span className="absolute inset-0 bg-ink/10" />
      </div>
    </div>
  );
}

interface CabinetStickProps {
  product: CabinetProduct;
  onFocus: () => void;
  onBlur: () => void;
}

/**
 * One stick on a shelf: a link to its product, lifting off the shelf on hover with its name above.
 * The hero stick's slot is where its 3D twin sets off from (CabinetTraveller); the photo hides while
 * that one is away (data-flown).
 */
function CabinetStick({ product, onFocus, onBlur }: CabinetStickProps) {
  const info = productInfo(product.range);
  return (
    <Link
      href={productHref(info.slug)}
      aria-label={`${info.name}, ${info.scent}`}
      onFocus={onFocus}
      onBlur={onBlur}
      data-model-anchor={product.hero ? "shelf" : undefined}
      className="group pointer-events-auto absolute block data-flown:invisible"
      style={place(productRect(product))}
    >
      {/* Its shadow stays on the shelf */}
      <span
        aria-hidden="true"
        className="absolute bottom-0 left-1/2 h-[7%] w-[88%] -translate-x-1/2 translate-y-[40%] rounded-[50%] bg-ink/35 blur-[3px] transition-opacity duration-500 group-hover:opacity-50"
      />
      {/* Multiplied over the shelf, so the shot's white backdrop disappears into it */}
      <span className="absolute inset-0 mix-blend-multiply transition-transform duration-500 ease-out-expo group-hover:translate-y-[-5%] group-focus-visible:translate-y-[-5%]">
        <CroppedImage
          src={info.src(product.view)}
          width={SHOT_SIZE.width}
          height={SHOT_SIZE.height}
          sizes={SHOT_SIZES}
          crop={shotCrop(product.view)}
          className="size-full"
        />
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 rounded-full bg-ink px-2.5 py-1 text-micro whitespace-nowrap text-paper opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
      >
        {info.name} · {info.scent}
      </span>
    </Link>
  );
}
