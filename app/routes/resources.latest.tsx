import type { Route } from './+types/resources.latest';
import { fetchLatestPrices, OilPriceApiError } from '../lib/oilPriceApi.server';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const codesParam = url.searchParams.get('codes');
  const codes = codesParam ? codesParam.split(',').filter(Boolean) : [];

  if (!codes.length)
    return Response.json({ updatedAt: new Date().toISOString(), prices: {} });

  try {
    const prices = await fetchLatestPrices(codes);
    return Response.json({ updatedAt: new Date().toISOString(), prices });
  } catch (err) {
    const status = err instanceof OilPriceApiError ? (err.status ?? 502) : 502;
    const message =
      err instanceof Error ? err.message : 'Failed to fetch latest prices';
    return Response.json(
      { updatedAt: new Date().toISOString(), prices: {}, error: message },
      { status },
    );
  }
}
