export interface Commodity {
  code: string;
  name: string;
  category: "energy" | "metals" | "agriculture";
  currency: string;
  unit: string;
  update_frequency: string;
  description: string;
}

export const CATALOG: Commodity[] = [
  {
    code: "WTI_USD",
    name: "Crude Oil (WTI)",
    category: "energy",
    currency: "USD",
    unit: "barrel",
    update_frequency: "every 20s",
    description: "US benchmark crude, priced for delivery at Cushing, OK.",
  },
  {
    code: "BRENT_CRUDE_USD",
    name: "Crude Oil (Brent)",
    category: "energy",
    currency: "USD",
    unit: "barrel",
    update_frequency: "every 20s",
    description: "North Sea benchmark used to price ~2/3 of global crude.",
  },
  {
    code: "NATGAS_USD",
    name: "Natural Gas",
    category: "energy",
    currency: "USD",
    unit: "MMBtu",
    update_frequency: "every 20s",
    description: "Henry Hub natural gas futures reference price.",
  },
  {
    code: "GOLD_USD",
    name: "Gold",
    category: "metals",
    currency: "USD",
    unit: "troy oz",
    update_frequency: "every 20s",
    description: "Spot gold, the classic macro safe-haven asset.",
  },
  {
    code: "SILVER_USD",
    name: "Silver",
    category: "metals",
    currency: "USD",
    unit: "troy oz",
    update_frequency: "every 20s",
    description: "Spot silver, industrial + precious metal demand mix.",
  },
  {
    code: "COPPER_USD",
    name: "Copper",
    category: "metals",
    currency: "USD",
    unit: "lb",
    update_frequency: "every 20s",
    description: "Industrial bellwether, tracks global construction demand.",
  },
  {
    code: "WHEAT_USD",
    name: "Wheat",
    category: "agriculture",
    currency: "USD",
    unit: "bushel",
    update_frequency: "every 20s",
    description: "Chicago wheat futures, a global food-price benchmark.",
  },
  {
    code: "CORN_USD",
    name: "Corn",
    category: "agriculture",
    currency: "USD",
    unit: "bushel",
    update_frequency: "every 20s",
    description: "Chicago corn futures, feed and ethanol demand driver.",
  },
];

export const CATALOG_BY_CODE: Record<string, Commodity> = Object.fromEntries(
  CATALOG.map((c) => [c.code, c])
);

export const DEFAULT_WATCHLIST = ["WTI_USD", "BRENT_CRUDE_USD", "NATGAS_USD"];

const CHART_PALETTE = [
  "#E8672E", // brand orange (WTI)
  "#2FBEB0", // teal (Brent)
  "#E0B23C", // yellow (nat gas)
  "#7C9EFF",
  "#E85D9E",
  "#4FD1C5",
  "#C6A15B",
  "#9AA7B4",
];

export function buildColorMap(codes: string[]): Record<string, string> {
  const map: Record<string, string> = {};
  codes.forEach((code) => {
    const idx = CATALOG.findIndex((c) => c.code === code);
    map[code] = CHART_PALETTE[(idx >= 0 ? idx : 0) % CHART_PALETTE.length];
  });
  return map;
}

export function humanizeCategory(slug: string): string {
  return slug
    .split("_")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}
