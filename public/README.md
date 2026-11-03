# public/

Static files, served from the site root (`public/images/home/hero.jpg` → `/images/home/hero.jpg`).

| Folder | Put here |
| --- | --- |
| `images/home/` | Home page hero, campaign and story imagery |
| `images/about/` | About page photography |
| `images/banners/` | Promo and collection banners |
| `images/categories/` | Fallback category tiles (z-commerce `imgsrc` wins when set) |
| `images/products/` | Local product shots only — real product media comes from z-commerce. One folder per range (`balanced/`, `grounded/`, `kinetic/`, `renewed/`) holding `sava-<range>-front/angle/back/base.jpg`; `shared/` holds the lifestyle and how-it-works images every range uses; the loose `sava-<range>.jpg` are the 3D sticks' label sources (`src/lib/sava-stick.ts`) |
| `images/placeholder/` | Placeholders used while data is missing — keep `product.svg` |
| `videos/` | Hero films and loops (`.mp4`, H.264, muted) — see `HERO_VIDEO` in `HomeHero.tsx` |
| `audios/` | UI sounds and audio clips |
| `icons/` | SVG icons not covered by Remix Icon |
| `fonts/` | Licensed brand fonts — wire them up in `src/lib/fonts.ts` with `next/font/local` |

Favicon: `src/app/icon.svg`. Social card: `src/app/og/route.tsx`. Logo: `logo.svg`.

Keep images web-sized (≤ 2400px on the long edge, WebP/AVIF/JPG) and use `next/image` to render them.
