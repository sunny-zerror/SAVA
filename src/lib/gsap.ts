"use client";

/*
 * Import GSAP from here so plugins are registered once:
 *   import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
 * ScrambleTextPlugin needs no import of its own: registered here, `scrambleText` works in any tween.
 */
import gsap from "gsap";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, useGSAP);

export { gsap, ScrollTrigger, SplitText, useGSAP };
