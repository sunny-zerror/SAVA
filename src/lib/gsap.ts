"use client";

/*
 * Import GSAP from here so plugins are registered once:
 *   import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };
