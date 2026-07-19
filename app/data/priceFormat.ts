export interface HistoryPoint {
  time: string;
  price: number;
}

export type PriceRange = 'past_day' | 'past_week' | 'past_month';

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
  currency = 'USD',
): string {
  if (value == null || !Number.isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}

export function formatPercent(
  value: number | null | undefined,
  digits = 2,
): string {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return 'never';
  const seconds = Math.max(
    0,
    Math.round((Date.now() - new Date(iso).getTime()) / 1000),
  );
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}
