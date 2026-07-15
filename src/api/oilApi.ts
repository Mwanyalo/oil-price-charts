import type {
  Commodity,
  LatestPrice,
  HistoryPoint,
  PriceRange,
  CommodityCode,
} from '../types/oil';

const BASE_URL = import.meta.env.VITE_BASE_API as string;
const API_KEY = import.meta.env.VITE_OILPRICE_API_KEY as string;

export class ApiKeyMissingError extends Error {
  constructor() {
    super('No OilPriceAPI key configured. Set VITE_OILPRICE_API_KEY in .env.');
    this.name = 'ApiKeyMissingError';
  }
}

export const isConfigured = (): boolean => Boolean(API_KEY);

const request = async <T>(
  path: string,
  params: Record<string, string | undefined> = {},
): Promise<T> => {
  if (!API_KEY) throw new ApiKeyMissingError();

  const url = new URL(BASE_URL + path);
  Object.entries(params).forEach(
    ([k, v]) => v != null && url.searchParams.set(k, v),
  );

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Token ${API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`OilPriceAPI ${res.status}: ${body || res.statusText}`);
  }
  const json = await res.json();
  if (json.status && json.status !== 'success') {
    throw new Error(json.message || 'OilPriceAPI request failed');
  }
  if (json.data == null) {
    throw new Error(`OilPriceAPI returned no data for ${path}`);
  }
  return json.data as T;
};

/** Full catalog of tracked commodities */
export const getCommodities = async (): Promise<Commodity[]> => {
  const data = await request<Commodity[] | { commodities?: Commodity[] }>(
    '/commodities',
  );
  if (Array.isArray(data)) return data;
  return data.commodities ?? [];
};

/** Latest spot price for a single commodity code */
export const getLatestPrice = async (
  code: CommodityCode,
): Promise<LatestPrice> => {
  const data = await request<Record<string, unknown>>('/prices/latest', {
    by_code: code,
  });
  const price =
    typeof data.price === 'number' ? data.price : Number(data.price);
  return {
    code: (data.code as string) ?? code,
    price,
    formatted:
      (data.formatted as string) ??
      (Number.isFinite(price) ? `$${price.toFixed(2)}` : '—'),
    currency: (data.currency as string) || 'USD',
    unit: (data.unit as string) || 'barrel',
    timestamp:
      (data.created_at as string) ||
      (data.timestamp as string) ||
      new Date().toISOString(),
  };
};

/** Latest prices for an arbitrary set of commodity codes */
export const getLatestPrices = async (
  codes: CommodityCode[],
): Promise<LatestPrice[]> => {
  if (codes.length === 0) return [];
  const results = await Promise.allSettled(codes.map((c) => getLatestPrice(c)));
  return results
    .filter(
      (r): r is PromiseFulfilledResult<LatestPrice> => r.status === 'fulfilled',
    )
    .map((r) => r.value);
};

/** Historical series for a commodity. */
export const getPriceHistory = async (
  code: CommodityCode,
  range: PriceRange = 'past_week',
): Promise<HistoryPoint[]> => {
  const data = await request<unknown>(`/prices/${range}`, { by_code: code });
  const points: Record<string, unknown>[] = Array.isArray(data)
    ? (data as Record<string, unknown>[])
    : ((data as Record<string, unknown>).prices as Record<string, unknown>[]) ||
      ((data as Record<string, unknown>).data as Record<string, unknown>[]) ||
      [];

  return points
    .map((p) => ({
      time: (p.created_at as string) || (p.timestamp as string) || '',
      price: typeof p.price === 'number' ? p.price : Number(p.price),
    }))
    .filter((p) => p.time && Number.isFinite(p.price));
};
