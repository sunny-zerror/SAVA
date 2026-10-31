import { RiAddLine } from "@remixicon/react";

/** Native <details> accordion — works without JS and is indexable */
export default function Accordion({ items }: { items: { title: string; content: React.ReactNode }[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.title} className="group border-b border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-h6 [&::-webkit-details-marker]:hidden">
            {item.title}
            <RiAddLine className="size-4 transition-transform duration-300 group-open:rotate-45" />
          </summary>
          <div className="pb-5 text-body text-muted">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
