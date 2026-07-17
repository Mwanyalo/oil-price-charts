export interface HistoryPoint {
  time: string;
  price: number;
}

export interface PriceData {
  price: number;
  timestamp: string;
}

const API_KEY = process.env.VITE_OILPRICE_API_KEY;
const API_BASE = process.env.VITE_BASE_API;

export class MissingAPIKeyError extends Error {
  constructor() {
    super('API key not configured');
    this.name = 'MissingAPIKeyError';
  }
}

/**
 * Fetch latest price for a commodity
 */
export async function getLatestPrice(code: string): Promise<PriceData> {
  if (!API_KEY) {
    throw new MissingAPIKeyError();
  }

  try {
    const response = await fetch(
      `${API_BASE}/commodities/${code}?key=${encodeURIComponent(API_KEY)}`,
    );

    if (response.status === 401 || response.status === 403) {
      throw new MissingAPIKeyError();
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    if (err instanceof MissingAPIKeyError) throw err;
    throw new Error(`Failed to fetch price for ${code}: ${err}`);
  }
}

/**
 * Fetch historical price series for a commodity
 */
export async function getPriceSeries(
  code: string,
  range: 'past_day' | 'past_week' | 'past_month',
): Promise<HistoryPoint[]> {
  if (!API_KEY) {
    throw new MissingAPIKeyError();
  }

  try {
    const response = await fetch(
      `${API_BASE}/commodities/${code}/history?range=${range}&key=${encodeURIComponent(API_KEY)}`,
    );

    if (response.status === 401 || response.status === 403) {
      throw new MissingAPIKeyError();
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.series || [];
  } catch (err) {
    if (err instanceof MissingAPIKeyError) throw err;
    throw new Error(`Failed to fetch series for ${code}: ${err}`);
  }
}

/**
 * Get latest price from all tracked commodities
 */
export async function getLatestPrices(
  codes: string[],
): Promise<Record<string, PriceData>> {
  try {
    const results: Record<string, PriceData> = {};
    const promises = codes.map((code) =>
      getLatestPrice(code)
        .then((data) => {
          results[code] = data;
        })
        .catch((err) => {
          console.warn(`Failed to fetch ${code}:`, err);
        }),
    );
    await Promise.all(promises);
    return results;
  } catch (err) {
    throw err;
  }
}

/**
 * Calculate the change (absolute and percentage) in a price series
 */
export function seriesChange(series: HistoryPoint[] | null | undefined) {
  if (!series || series.length < 2) return { abs: 0, pct: 0 };
  const first = series[0].price;
  const last = series[series.length - 1].price;
  const abs = last - first;
  const pct = first ? (abs / first) * 100 : 0;
  return { abs, pct };
}
