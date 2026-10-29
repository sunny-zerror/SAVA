# SAVA

Storefront for **SAVA**, built on the Zerror z-com starter: Next.js (App Router) + TypeScript + Tailwind CSS v4, with all catalogue, cart, account and order data coming from the **z-commerce** GraphQL API.

## Getting started

```bash
cp .env.example .env.local   # then fill in the z-commerce values
npm install
npm run dev                  # http://localhost:3000
```

With the z-commerce values empty the site runs on a **demo catalogue** (`src/data/mock-products.ts`), so pages can be designed before the store exists. Cart, sign-in, checkout and the contact form need the real API.

| Variable                       | What it is                                                             |
| ------------------------------ | ---------------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`         | Public URL of this site (canonical URLs, sitemap, OG tags)             |
| `NEXT_PUBLIC_GRAPHQL_API_URL`  | z-commerce GraphQL endpoint                                            |
| `NEXT_PUBLIC_BACKEND_ENDPOINT` | z-commerce REST base, used to verify Nimbbl payments                   |
| `NEXT_PUBLIC_DB_TOKEN`         | The client's store token from the z-commerce admin (sent as `dbtoken`) |

## Scripts

| Command                       | Does                                                 |
| ----------------------------- | ---------------------------------------------------- |
| `npm run dev`                 | Dev server                                           |
| `npm run build` / `npm start` | Production build / serve it                          |
| `npm run typecheck`           | TypeScript, no emit                                  |
| `npm run lint`                | ESLint (Next core-web-vitals + TypeScript rules)     |
| `npm run format`              | Prettier, with Tailwind class sorting                |
| `npm run check`               | typecheck + lint + format check — run before pushing |

## Structure

```
src/
├── app/                      Routes (App Router) — thin: metadata + composition
│   ├── page.tsx              Home
│   ├── about/  contact/
│   ├── shop/
│   │   ├── (listing)/        /shop — all products (?category=, ?page=) + loading skeleton
│   │   └── [slug]/           Product detail: gallery, options, add to bag, JSON-LD
│   ├── login/  signup/
│   ├── account/              Tabs: overview · orders · addresses · profile (?tab=)
│   ├── checkout/             Checkout → Nimbbl → thank-you/ or payment-failed/
│   ├── og/route.tsx          Generated 1200×630 social card
│   ├── icon.svg              Favicon
│   └── sitemap.ts  robots.ts  manifest.ts  not-found.tsx  error.tsx
├── components/
│   ├── layout/               Header, Footer, CartDrawer, MobileMenu, SiteLayout, Logo
│   ├── providers/            Apollo, Lenis smooth scroll, store hydration
│   ├── ui/                   Button, form fields, Tabs, Drawer, Price, Accordion…
│   ├── product/              ProductCard, ProductGrid, ProductGallery, ProductPurchase
│   ├── sections/             Page sections: home/, about/, contact/
│   ├── auth/  account/  checkout/
│   └── seo/JsonLd.tsx
├── config/                   site.ts (brand, contact, SEO routes) · navigation.ts
├── graphql/                  z-commerce operations: queries/, mutations/, fields.ts
├── services/catalog.ts       Server-side catalogue reads (API or demo data)
├── hooks/                    useCart, useAuth
├── store/                    Zustand: auth, cart UI + guest id, toasts
├── lib/                      apollo/ (client + server), seo, schema, payment, fonts, gsap, env
├── utils/                    url, format, media, product, errors, cn
├── types/                    z-commerce data types
├── data/mock-products.ts     Demo catalogue
├── styles/globals.css        Design tokens, type scale, layout utilities
└── proxy.ts                  Redirects signed-out visitors away from /account
```

## How data flows

- **Catalogue (SEO pages)** — Server Components call `src/services/catalog.ts`, which queries z-commerce through the server Apollo client (cached, revalidated every 60s). Product and category pages get real metadata and JSON-LD.
- **Cart, account, checkout** — Client Components use Apollo hooks via `useCart()` / `useAuth()`. Every request carries `dbtoken` (the store) and, when signed in, `authtoken` (the customer). Expired access tokens are refreshed automatically.
- **Guests** get a `guestId`; their bag is merged into the account on sign-in.
- **Payment** — `clientCheckout` creates the order and returns a Nimbbl token → `src/lib/payment.ts` opens Nimbbl and verifies the result with the backend, which redirects to `/checkout/thank-you?orderId=…` or `/checkout/payment-failed`.

## Design system

All in `src/styles/globals.css` — change tokens there, not in components.

- **Colours** `ink paper muted line surface accent sale success` → `text-ink`, `bg-surface`, `border-line`…
- **Spacing** `section stack grid gutter header` → `py-section`, `gap-stack`, `gap-grid`, `px-gutter`, `h-header`. Values step up at the `md` breakpoint.
- **Layout** `container` (max width + gutters), `section` (vertical rhythm), `center`, `cover`.
- **Type** h1–h6 have a responsive scale (base layer, so utilities override). Text utilities: `text-eyebrow`, `text-body-lg`, `text-body`, `text-caption`, `text-cta`. Fonts: `font-primary` (headings) and `font-secondary` (body), set in `src/lib/fonts.ts`.

## Launch checklist

- [ ] `src/config/site.ts`: name, tagline, description, contact, address, socials, keywords
- [ ] Brand fonts in `src/lib/fonts.ts`, colours in `globals.css`
- [ ] `src/app/icon.svg`, `public/logo.svg`, social card (`src/app/og/route.tsx` or a designed image)
- [ ] `next.config.ts`: narrow `images.remotePatterns` to the z-commerce asset host
- [ ] Production env vars set on the host (Vercel → Settings → Environment Variables)
- [ ] Delete `src/data/mock-products.ts` usage once the store is live (optional)
