import type { Route } from './+types/resources.series';
import { fetchHistory, OilPriceApiError } from '../lib/oilPriceApi.server';
import type { PriceRange } from '../data/priceFormat';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || '';
  const range = (url.searchParams.get('range') as PriceRange) || 'past_day';

  if (!code)
    return Response.json(
      { code, range, data: [], error: 'A commodity code is required' },
      { status: 400 },
    );

  try {
    const data = await fetchHistory(code, range);
    return Response.json({ code, range, data });
  } catch (err) {
    const status = err instanceof OilPriceApiError ? (err.status ?? 502) : 502;
    const message =
      err instanceof Error ? err.message : 'Failed to fetch history';
    return Response.json({ code, range, data: [], error: message }, { status });
  }
}
