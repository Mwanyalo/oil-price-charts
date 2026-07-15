import {
  useDataSource,
  type UseDataSourceResult,
} from '../providers/DataProvider';
import {
  getCommodities,
  getLatestPrices,
  getPriceHistory,
} from '../api/oilApi';
import type {
  Commodity,
  LatestPrice,
  HistoryPoint,
  PriceRange,
  CommodityCode,
} from '../types/oil';

/**
 * The full commodity catalog rarely changes (OilPriceAPI's own docs recommend
 * caching it for ~24h), so this is fetched once per session and shared by
 * every consumer — no live polling.
 */
export const useCommodities = (): UseDataSourceResult<Commodity[]> =>
  useDataSource<Commodity[]>({
    key: 'commodities:catalog',
    fetcher: getCommodities,
    live: { enabled: false },
  });

/**
 * Latest prices for a specific set of commodity codes (typically the user's
 * watchlist). The cache key includes the sorted code list, so different
 * watchlists don't collide, while identical watchlists across components
 * share one poll.
 */
export const useLatestPrices = (
  codes: CommodityCode[],
  {
    live = true,
    intervalMs = 20000,
  }: { live?: boolean; intervalMs?: number } = {},
): UseDataSourceResult<LatestPrice[]> => {
  const cacheKey = `prices:latest:${[...codes].sort().join(',')}`;
  return useDataSource<LatestPrice[]>({
    key: cacheKey,
    fetcher: () => getLatestPrices(codes),
    live: { enabled: live && codes.length > 0, intervalMs },
  });
};

/**
 * Historical series for one commodity + range. Charts default to live=false
 * (a backward-looking range doesn't need to repoll every few seconds); pass
 * live=true to make a chart grow in real time instead.
 */
export const usePriceHistory = (
  code: CommodityCode,
  range: PriceRange = 'past_week',
  {
    live = false,
    intervalMs = 30000,
  }: { live?: boolean; intervalMs?: number } = {},
): UseDataSourceResult<HistoryPoint[]> =>
  useDataSource<HistoryPoint[]>({
    key: `prices:history:${code}:${range}`,
    fetcher: () => getPriceHistory(code, range),
    live: { enabled: live, intervalMs },
  });

/**
 * History for an arbitrary, variable-length list of codes (e.g. a watchlist
 * the user can grow or shrink), returned as one code -> series map. Fetched
 * as a single data-source entry so the hook count stays stable across
 * renders regardless of how many codes are tracked — looping individual
 * usePriceHistory() calls per code would break the rules of hooks whenever
 * the watchlist changes size.
 */
export const usePriceHistories = (
  codes: CommodityCode[],
  range: PriceRange = 'past_day',
  {
    live = false,
    intervalMs = 30000,
  }: { live?: boolean; intervalMs?: number } = {},
): UseDataSourceResult<Record<CommodityCode, HistoryPoint[]>> => {
  const sortedKey = [...codes].sort().join(',');
  return useDataSource<Record<CommodityCode, HistoryPoint[]>>({
    key: `prices:histories:${sortedKey}:${range}`,
    fetcher: async () => {
      const entries = await Promise.all(
        codes.map(
          async (code) => [code, await getPriceHistory(code, range)] as const,
        ),
      );
      return Object.fromEntries(entries);
    },
    live: { enabled: live && codes.length > 0, intervalMs },
  });
};
