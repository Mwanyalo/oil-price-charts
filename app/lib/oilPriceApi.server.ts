import type { HistoryPoint, PriceRange } from '../data/priceFormat';

const BASE_URL = 'https://api.oilpriceapi.com/v1';

export class OilPriceApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'OilPriceApiError';
    this.status = status;
  }
}

interface RawPricePoint {
  price: number;
  currency?: string;
  code: string;
  created_at?: string;
  updated_at?: string;
}

interface RawCommodity {
  code: string;
  name: string;
  currency?: string;
  category?: string;
  description?: string;
  unit?: string;
  unit_description?: string;
  update_frequency?: string;
}

export interface ApiCommodity {
  code: string;
  name: string;
  currency: string;
  category: string;
  description: string;
  unit: string;
  unitDescription?: string;
  updateFrequency?: string;
}

let commodityCache: { value: ApiCommodity[]; expiresAt: number } | null = null;
const COMMODITY_CACHE_MS = 24 * 60 * 60 * 1000;

function hasApiKey(): boolean {
  return Boolean(process.env.OILPRICEAPI_KEY);
}

async function apiFetch(path: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );

  const key = process.env.OILPRICEAPI_KEY;
  const res = await fetch(url.toString(), {
    headers: key ? { Authorization: `Token ${key}` } : undefined,
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) {
    const payload = await res.json().catch(() => null);
    const apiError = payload?.error;
    if (res.status === 401)
      throw new OilPriceApiError('Missing or invalid OILPRICEAPI_KEY', 401);
    if (
      res.status === 403 &&
      apiError?.code === 'EMAIL_CONFIRMATION_REQUIRED'
    ) {
      throw new OilPriceApiError(
        'OilPriceAPI requires email confirmation before serving more requests. Confirm your account at https://www.oilpriceapi.com/confirm',
        403,
      );
    }
    if (res.status === 429)
      throw new OilPriceApiError(
        'OilPriceAPI rate limit hit slow down polling',
        429,
      );
    throw new OilPriceApiError(
      apiError?.message || `OilPriceAPI request failed (${res.status})`,
      res.status,
    );
  }
  return res.json();
}

/** Latest prices for the given codes. */
export async function fetchLatestPrices(
  codes: string[],
): Promise<Record<string, HistoryPoint>> {
  const json = await apiFetch('/prices/latest', { by_code: codes.join(',') });

  const rows: RawPricePoint[] =
    json.data?.prices ?? (json.data?.code ? [json.data] : []);

  const out: Record<string, HistoryPoint> = {};
  for (const row of rows) {
    if (!codes.includes(row.code)) continue;
    const time = row.created_at ?? row.updated_at ?? new Date().toISOString();
    out[row.code] = { time, price: row.price };
  }
  return out;
}

/** The API catalog, so cache it for a day. */
export async function fetchCommodities(): Promise<ApiCommodity[]> {
  if (!hasApiKey())
    throw new OilPriceApiError(
      'The live commodity catalog requires OILPRICEAPI_KEY',
      401,
    );
  if (commodityCache && commodityCache.expiresAt > Date.now())
    return commodityCache.value;

  const json = await apiFetch('/commodities');
  const commodities = (
    Array.isArray(json.data?.commodities) ? json.data.commodities : []
  )
    .filter((item: RawCommodity) => item?.code && item?.name)
    .map((item: RawCommodity): ApiCommodity => ({
      code: item.code,
      name: item.name,
      currency: item.currency || 'USD',
      category: item.category || 'other',
      description: item.description || 'Live commodity from OilPriceAPI.',
      unit: item.unit || 'unit',
      unitDescription: item.unit_description,
      updateFrequency: item.update_frequency,
    }));
  commodityCache = {
    value: commodities,
    expiresAt: Date.now() + COMMODITY_CACHE_MS,
  };
  return commodities;
}

/** Raw/aggregated spot points for one commodity. */
export async function fetchHistory(
  code: string,
  range: PriceRange,
): Promise<HistoryPoint[]> {
  if (!hasApiKey()) {
    throw new OilPriceApiError(
      'Historical data requires OILPRICEAPI_KEY the free demo endpoint only covers latest prices',
      401,
    );
  }
  const interval = range === 'past_day' ? '1h' : '1d';
  const json = await apiFetch(`/prices/${range}`, {
    by_code: code,
    interval,
    per_page: '100',
  });
  const rows: RawPricePoint[] = json.data?.prices ?? [];

  return rows
    .map((r) => ({
      time: r.created_at ?? new Date().toISOString(),
      price: r.price,
    }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
}

export function isOilPriceApiKeyConfigured(): boolean {
  return hasApiKey();
}
