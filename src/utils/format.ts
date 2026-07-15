import type { HistoryPoint, SeriesChange } from '../types/oil';

export const formatPrice = (
  value: number | null | undefined,
  {
    currency = 'USD',
    digits = 2,
  }: { currency?: string | null; digits?: number } = {},
): string => {
  if (value == null || !Number.isFinite(value)) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${currency ?? '$'} ${value.toFixed(digits)}`;
  }
};

export const formatPercent = (
  value: number | null | undefined,
  digits = 2,
): string => {
  if (value == null || !Number.isFinite(value)) return '—';
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(digits)}%`;
};

export const formatRelativeTime = (
  timestamp: number | null | undefined,
): string => {
  if (!timestamp) return 'never';
  const seconds = Math.max(0, Math.round((Date.now() - timestamp) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

export const formatClockTime = (
  isoString: string | null | undefined,
): string => {
  if (!isoString) return '';
  try {
    return new Date(isoString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

/** % change between the first and last point of a series. */
export const seriesChange = (
  series: HistoryPoint[] | null | undefined,
): SeriesChange => {
  if (!series || series.length < 2) return { abs: 0, pct: 0 };
  const first = series[0].price;
  const last = series[series.length - 1].price;
  const abs = last - first;
  const pct = first ? (abs / first) * 100 : 0;
  return { abs, pct };
};
