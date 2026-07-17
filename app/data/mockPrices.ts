export interface HistoryPoint {
  time: string;
  price: number;
}

export type PriceRange = "past_day" | "past_week" | "past_month";

const BASE_PRICE: Record<string, number> = {
  WTI_USD: 76.4,
  BRENT_CRUDE_USD: 80.1,
  NATGAS_USD: 3.28,
  GOLD_USD: 3401.5,
  SILVER_USD: 38.2,
  COPPER_USD: 4.61,
  WHEAT_USD: 5.42,
  CORN_USD: 4.18,
};

const VOLATILITY: Record<string, number> = {
  WTI_USD: 0.012,
  BRENT_CRUDE_USD: 0.011,
  NATGAS_USD: 0.03,
  GOLD_USD: 0.006,
  SILVER_USD: 0.014,
  COPPER_USD: 0.01,
  WHEAT_USD: 0.016,
  CORN_USD: 0.015,
};

// Small seeded PRNG so a given code+bucket always produces the same point
// (keeps SSR output stable within a render, while still drifting over time).
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

const RANGE_CONFIG: Record<PriceRange, { points: number; stepMs: number }> = {
  past_day: { points: 48, stepMs: 30 * 60 * 1000 }, // 30 min steps over 24h
  past_week: { points: 56, stepMs: 3 * 60 * 60 * 1000 }, // 3h steps over 7d
  past_month: { points: 60, stepMs: 12 * 60 * 60 * 1000 }, // 12h steps over 30d
};

/** Deterministic-ish price series for a commodity, walking up to "now". */
export function generateSeries(code: string, range: PriceRange): HistoryPoint[] {
  const base = BASE_PRICE[code] ?? 50;
  const vol = VOLATILITY[code] ?? 0.01;
  const { points, stepMs } = RANGE_CONFIG[range];
  const seed = hashCode(code) ^ Math.floor(Date.now() / (5 * 60 * 1000)); // drifts every 5 min
  const rand = mulberry32(seed);

  const series: HistoryPoint[] = [];
  let price = base * (0.97 + rand() * 0.06);
  const now = Date.now();

  for (let i = points - 1; i >= 0; i--) {
    const drift = (rand() - 0.5) * vol * price;
    price = Math.max(price + drift, price * 0.5);
    series.push({
      time: new Date(now - i * stepMs).toISOString(),
      price: Number(price.toFixed(2)),
    });
  }
  return series;
}

export function latestFromSeries(series: HistoryPoint[]) {
  return series[series.length - 1];
}

export function seriesChange(series: HistoryPoint[] | null | undefined) {
  if (!series || series.length < 2) return { abs: 0, pct: 0 };
  const first = series[0].price;
  const last = series[series.length - 1].price;
  const abs = last - first;
  const pct = first ? (abs / first) * 100 : 0;
  return { abs, pct };
}

export function formatPrice(
  value: number | null | undefined,
  currency = "USD"
): string {
  if (value == null || !Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatPercent(value: number | null | undefined, digits = 2): string {
  if (value == null || !Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "never";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
