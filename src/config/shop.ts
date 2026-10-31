/*
 * Extra filter groups for the shop listing's sidebar. "Range" comes from the catalogue's categories;
 * these groups have no catalogue attribute behind them yet, so their options show as labels only.
 * When z-commerce exposes them (tags / attributes), turn the options into filter links like Range.
 */
export const shopFilterGroups: { title: string; options: string[] }[] = [
  { title: "Type", options: ["Antiperspirant", "Deodorant", "Travel size"] },
  { title: "Ingredients", options: ["Aluminium-free", "Botanical oils", "Fragrance-free"] },
];
