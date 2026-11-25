/*
 * The site's field look: soft tinted fields that turn white with a blue ring on focus; errors swap
 * the ring to sale red. Kept apart from form.tsx (a Client Component) so Server Components can use it
 * too (ShopFilters, BlogSidebar).
 */
export const fieldClass =
  "h-12 w-full rounded-lg border border-transparent bg-surface px-4 text-input text-ink outline-none transition-[background-color,border-color,box-shadow] duration-300 placeholder:text-muted/60 hover:border-line focus:border-accent focus:bg-paper focus:ring-4 focus:ring-accent/15 disabled:cursor-not-allowed disabled:text-muted aria-[invalid=true]:border-sale aria-[invalid=true]:bg-paper aria-[invalid=true]:focus:ring-sale/15";
