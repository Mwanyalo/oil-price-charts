import { fetchCommodities, OilPriceApiError } from '../lib/oilPriceApi.server';

export async function loader() {
  try {
    return Response.json({
      commodities: await fetchCommodities(),
      source: 'oilpriceapi',
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch commodities';
    const status =
      error instanceof OilPriceApiError ? (error.status ?? 502) : 502;
    return Response.json(
      { commodities: [], source: 'unavailable', error: message },
      { status },
    );
  }
}
