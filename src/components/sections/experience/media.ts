import type { SavaStickVariant } from "@/lib/sava-stick";

/*
 * The /home page's photography, in one place. Generated images (prompts: docs/home-image-prompts.md,
 * named as there) are converted into public/images/experience/ as they're made; until one is, its
 * entry points at a stand-in from the existing library, so every section works in the meantime.
 */
export const experienceMedia = {
  hero: { desktop: "/images/home/hero-bg.png", mobile: "/images/home/hero-bg.png" },
  features: {
    sweat: "/images/products/shared/sava-sweat-ducts.png",
    scent: "/images/about/confidence_img_2.png",
    apply: "/images/about/claim_img1.png",
  },
  stainFree: "/images/about/banner.png",
  heat: "/images/products/shared/sava-story-runner.png",
  closing: "/images/about/gym_img.png",
  scent: {
    balanced: "/images/products/sava-balanced.jpg",
    kinetic: "/images/products/sava-kinetic.jpg",
    renewed: "/images/products/sava-renewed.jpg",
    grounded: "/images/products/grounded/sava-grounded-front.jpg",
  } satisfies Record<SavaStickVariant, string>,
  day: {
    run: "/images/about/confidence_img_1.png",
    commute: "/images/home/review-1.png",
    meetings: "/images/about/confidence_img_2.png",
    gym: "/images/about/gym_img.png",
    night: "/images/home/review-3.png",
  },
  bento: {
    pocket: "/images/products/shared/sava-story-hand.png",
    gymBag: "/images/about/banner.png",
    twist: "/images/products/balanced/sava-balanced-base.jpg",
  },
  lineup: "/images/about/banner.png",
  /** The hero's film tile — a brand film when there is one */
  film: "/videos/listing_hero_video.mp4",
  /** The static stick shown where the 3D one stands, for reduced motion / no WebGL */
  stick: "/images/home/hero-stick.png",
  /** Each range's packshot, standing in for the 3D stick in the picker the same way */
  packshot: {
    balanced: "/images/products/sava-balanced.jpg",
    kinetic: "/images/products/sava-kinetic.jpg",
    renewed: "/images/products/sava-renewed.jpg",
    grounded: "/images/products/grounded/sava-grounded-front.jpg",
  } satisfies Record<SavaStickVariant, string>,
};
