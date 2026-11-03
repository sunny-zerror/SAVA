/*
 * Extra filter groups for the shop listing's sidebar. "Range" comes from the catalogue's categories;
 * these groups have no catalogue attribute behind them yet, so their options show as labels only.
 * When z-commerce exposes them (tags / attributes), turn the options into filter links like Range.
 */
export const shopFilterGroups: { title: string; options: string[] }[] = [
  { title: "Type", options: ["Antiperspirant", "Deodorant", "Travel size"] },
  { title: "Ingredients", options: ["Aluminium-free", "Botanical oils", "Fragrance-free"] },
];

/*
 * The product page's pickers, by z-commerce option name: the size option shows as pills beside the
 * name, the pack option as priced cards with a tier label over each. Any other option gets pills.
 */
export const productPickers = {
  size: "Size",
  pack: "Pack",
  packTiers: { "Pack of 01": "Regular", "Pack of 02": "Popular", "Pack of 04": "Premium" } as Record<string, string>,
  /** The pack the page opens on (when the product has it); other options open on their first choice */
  defaultPack: "Pack of 02",
};
