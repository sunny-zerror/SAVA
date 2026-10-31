import { RiAddLine, RiSubtractLine } from "@remixicon/react";
import Link from "next/link";
import FaqAccordion from "@/components/sections/home/FaqAccordion";
import { shopFilterGroups } from "@/config/shop";
import type { Category } from "@/types";
import { cn } from "@/utils/cn";

interface ShopFiltersProps {
  categories: Category[];
  /** Slug of the active category ("" for all) */
  active: string;
}

/**
 * One collapsible group: native <details>, so it works without JS; "+" turns to "−" when open.
 * Its height animates open and shut via the FaqAccordion around the groups.
 */
function Group({ title, open, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    // overflow-hidden: while its height animates, the list is clipped to it instead of spilling out
    <details open={open} className="group overflow-hidden border-b border-line py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between text-h6 [&::-webkit-details-marker]:hidden">
        {title}
        <RiAddLine aria-hidden="true" className="size-4 group-open:hidden" />
        <RiSubtractLine aria-hidden="true" className="hidden size-4 text-accent group-open:block" />
      </summary>
      <div className="pt-4">{children}</div>
    </details>
  );
}

/**
 * The shop sidebar. Range lists the catalogue's categories as filter links (the active one in
 * SAVA blue); the other groups come from src/config/shop.ts.
 */
export default function ShopFilters({ categories, active }: ShopFiltersProps) {
  const range = [{ slug: "", name: "All" }, ...categories];

  return (
    // Staggered as two blocks (heading, then the groups), not group by group: FaqAccordion tweens
    // each <details> itself and would cut a reveal on one short if it were toggled mid-way
    <aside aria-label="Filters" data-reveal="stagger" className="flex flex-col">
      <h2 className="border-b border-line pb-5 text-h4">Filter</h2>

      <FaqAccordion exclusive={false}>
        <Group title="Range" open>
          <ul className="flex flex-col gap-2 text-caption">
            {range.map((c) => {
              const current = active === c.slug;
              return (
                <li key={c.slug || "all"}>
                  <Link
                    href={c.slug ? `/shop?category=${c.slug}` : "/shop"}
                    aria-current={current ? "page" : undefined}
                    className={cn(
                      "link-underline transition-colors hover:text-accent",
                      current ? "text-accent" : "text-ink",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </Group>

        {shopFilterGroups.map((group) => (
          <Group key={group.title} title={group.title}>
            <ul className="flex flex-col gap-2 text-caption text-muted">
              {group.options.map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          </Group>
        ))}
      </FaqAccordion>
    </aside>
  );
}
