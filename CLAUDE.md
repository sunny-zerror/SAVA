# SAVA — working notes for Claude

Next.js App Router + TypeScript + Tailwind v4 storefront. All commerce data comes from the **z-commerce** GraphQL API (Zerror's MERN backend); this repo never stores products, carts or orders itself.

## Conventions

- **Pages stay thin.** `src/app/**/page.tsx` sets metadata (`createMetadata` / `createPageMetadata` from `src/lib/seo.ts`) and composes components. UI lives in `src/components/<area>/`.
- **Server first.** Catalogue data is fetched in Server Components through `src/services/catalog.ts` — never call Apollo directly from a page. Client Components (`"use client"`) only where there's interaction: cart, auth, forms, checkout.
- **GraphQL.** Every operation lives in `src/graphql/` as a `TypedDocumentNode`, using field strings from `fields.ts` (not fragments). Add new operations there and export them from `src/graphql/index.ts`; add matching types in `src/types/zcommerce.ts`.
- **z-commerce rules.** Requests need `dbtoken` (added by the Apollo links). Signed-in carts use `token`, guests use `guestId`. Strip `__typename` before sending query results back as input (`stripTypename`). Variants are matched by their `selectedOptions` names (`findVariant`).
- **State.** Zustand stores in `src/store/` — persisted ones use `skipHydration` and are rehydrated by `StoreHydration`; check `useAuthStore(s => s.hydrated)` before trusting "signed out". Use `toast.*` from `src/store/toast-store.ts` for notifications.
- **Styling.** Use tokens from `src/styles/globals.css` (`text-ink`, `bg-surface`, `py-section`, `px-gutter`, `gap-grid`, `container`…). Don't hard-code colours or add one-off spacing scales. One `h1` per page.
- **Type.** Fonts load in `src/lib/fonts.ts` (Inter Tight display, Inter text). Every piece of text takes a role from `globals.css` — `text-display`, `text-h1`–`text-h6`, `text-lead`, `text-body-lg`, `text-body`, `text-caption`, `text-micro`, `text-kicker`, `text-eyebrow`, `text-cta`, `text-input`; h1–h6 elements get theirs by default. No raw sizes (`text-sm/lg/xl…`), no `font-bold`, no extra tracking/leading on a role — `font-medium` for emphasis, `tabular-nums` for prices and counts.
- **Real 404s.** Pages that call `notFound()` (e.g. `/shop/[slug]`) must not sit under a `loading.tsx` — the streamed loading state commits a 200 status before the page can 404. That's why the shop listing's skeleton lives in the `shop/(listing)/` route group.
- **Images** go through `next/image` with `mediaUrl()`; static files go in the matching `public/` folder (see `public/README.md`).
- **Animation.** Import from `@/lib/gsap` (plugins registered once) and use `useGSAP` with a scope. Wrap motion in `gsap.matchMedia()` with `prefers-reduced-motion: no-preference`. Scrollable overlays need `data-lenis-prevent`.

## Before finishing a change

Run `npm run check` (typecheck + lint + Prettier) and fix what it reports.
