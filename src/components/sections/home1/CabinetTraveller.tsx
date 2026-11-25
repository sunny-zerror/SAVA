"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { createSavaHand, HOLD } from "@/lib/sava-hand";
import { createStickStage } from "@/lib/stick-stage";
import { lerp, TURN } from "@/lib/turntable";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The hero stick's flight on /home1 and the hand that catches it, in 3D on one fixed transparent canvas
 * over the page, both following the hero section's --stick-move (CabinetScroll):
 *   – the stick leaves its shelf ([data-model-anchor="shelf"], whose photo hides while it's away) for the
 *     landing slot ([data-model-anchor="palm"]), rising in an arc and growing, flipping once end over end
 *     (about its horizontal axis) on the way, and landing upright;
 *   – a rigged hand (src/lib/sava-hand.ts) rises from below the screen, open, and closes its fingers round
 *     the stick's base as it lands: the thumb up its side, index and middle fingertips under its front.
 * Once it's held, hand and stick breathe together; hovering the hand ([data-cabinet-grip]), or tapping it,
 * lifts them a little as the fingers ease and settle again. Being one 3D scene, the fingers pass in front
 * of the stick and behind it as they really would.
 * Without WebGL, or with reduced motion, nothing is drawn: the photos stay.
 */
export default function CabinetTraveller() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let disposed = false;
    let cleanup = () => {};

    // Loaded on demand so three.js stays out of the page's first bundle
    createStickStage(canvas).then(async (stage) => {
      const shelf = document.querySelector<HTMLElement>('[data-model-anchor="shelf"]');
      const palm = document.querySelector<HTMLElement>('[data-model-anchor="palm"]');
      const zone = document.querySelector<HTMLElement>("[data-cabinet-grip]");
      const section = shelf?.closest("section");
      if (!stage) return; // No WebGL — the photos stay
      if (disposed || !shelf || !palm || !section) {
        stage.dispose();
        return;
      }

      const [stick, hand] = await Promise.all([stage.build("balanced"), createSavaHand(stage.THREE)]);
      if (disposed) {
        stage.dispose();
        return;
      }
      stage.add(hand.root);
      await stage.warm();
      // Hides the photo of the hand holding the stick: the 3D pair takes its place (model-ready: in globals.css)
      document.documentElement.dataset.model = "ready";

      // Hovering the hand lifts it and the stick a touch while the fingers ease; a tap does it once
      const hover = { value: 0 };
      const lift = () => gsap.to(hover, { value: 1, duration: 0.7, ease: "power2.out", overwrite: true });
      const drop = () => gsap.to(hover, { value: 0, duration: 0.9, ease: "power2.inOut", overwrite: true });
      const tap = (event: PointerEvent) => {
        if (event.pointerType !== "touch") return;
        gsap.timeline().add(lift()).add(drop(), "+=0.15");
      };
      zone?.addEventListener("pointerenter", lift);
      zone?.addEventListener("pointerleave", drop);
      zone?.addEventListener("pointerdown", tap);

      let away = false;
      const render = (time: number) => {
        const move = Number(section.style.getPropertyValue("--stick-move")) || 0;

        // The shelf's photo stands in until the stick leaves it
        const leaving = move > 0.001;
        if (leaving !== away) {
          away = leaving;
          shelf.toggleAttribute("data-flown", away);
        }

        const to = palm.getBoundingClientRect();
        const onScreen = to.bottom > -200 && to.top < window.innerHeight + 200;
        const H = to.height;
        // Held: a slow breath, and the hover's lift (screen px, up)
        const held = clamp01((move - 0.9) / 0.1);
        const rise = Math.sin(time * 1.3) * 0.008 * H * held + hover.value * 0.05 * H;

        // The stick: shelf → slot, up in an arc, one flip end over end through the middle of the flight
        stick.tilt.visible = away && onScreen;
        if (stick.tilt.visible) {
          const e = ease(move);
          const from = shelf.getBoundingClientRect();
          const left = lerp(from.left, to.left, e);
          const top = lerp(from.top, to.top, e);
          const width = lerp(from.width, to.width, e);
          const height = lerp(from.height, to.height, e);
          const arc = Math.sin(Math.PI * e) * window.innerHeight * 0.14;
          stick.tilt.position.set(left + width / 2, -(top + height / 2 - arc) + rise, 0);
          stick.tilt.scale.setScalar(stage.fitScale(stick, width, height));
          stick.tilt.rotation.x = TURN * ease(clamp01((e - 0.12) / 0.7));
        }

        // The hand: up from below the screen while the stick flies, closing round it as it lands
        const up = ease(clamp01((move - 0.42) / 0.45));
        hand.root.visible = up > 0.001 && onScreen;
        if (hand.root.visible) {
          const below = (1 - up) * window.innerHeight;
          hand.root.scale.setScalar(H / HOLD.stickMetres);
          hand.root.position.set(
            to.left + to.width / 2 + HOLD.offset[0] * H,
            -(to.top + to.height / 2) + HOLD.offset[1] * H - below + rise,
            HOLD.offset[2] * H,
          );
          hand.root.rotation.z = HOLD.rotation[2] + Math.sin(time * 0.9) * 0.012 * held;
          hand.grip(lerp(0.12, 1, ease(clamp01((move - 0.8) / 0.2))) - hover.value * 0.15);
        }

        if (!stick.tilt.visible && !hand.root.visible) {
          stage.clear();
          return;
        }
        stage.render();
      };
      gsap.ticker.add(render);

      cleanup = () => {
        gsap.ticker.remove(render);
        gsap.killTweensOf(hover);
        zone?.removeEventListener("pointerenter", lift);
        zone?.removeEventListener("pointerleave", drop);
        zone?.removeEventListener("pointerdown", tap);
        shelf.removeAttribute("data-flown");
        delete document.documentElement.dataset.model;
        stage.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 size-full" />;
}
