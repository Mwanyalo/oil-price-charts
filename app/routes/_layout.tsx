import { Outlet } from 'react-router';
import type { Route } from './+types/_layout';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { TopBar } from '../components/layout/TopBar';
import { TickerTape } from '../components/layout/TickerTape';
import { WatchlistProvider, useWatchlist } from '../context/watchlist';
import { CatalogProvider } from '../context/catalog';
import { buildColorMap, type Commodity } from '../data/catalog';
import {
  fetchCommodities,
  isOilPriceApiKeyConfigured,
} from '../lib/oilPriceApi.server';

export async function loader({}: Route.LoaderArgs) {
  let commodities: Commodity[] = [];
  let catalogError: string | undefined;
  try {
    commodities = await fetchCommodities();
  } catch (error) {
    catalogError =
      error instanceof Error
        ? error.message
        : 'Unable to load the OilPriceAPI catalog.';
  }
  return { commodities, hasApiKey: isOilPriceApiKeyConfigured(), catalogError };
}

export function shouldRevalidate() {
  return false;
}

function Shell({
  hasApiKey,
  catalogError,
}: {
  hasApiKey: boolean;
  catalogError?: string;
}) {
  const { codes } = useWatchlist();
  const colors = buildColorMap(codes);

  return (
    <div className='app-shell'>
      <Sidebar />
      <div className='app-main'>
        <TopBar lastUpdated={null} />
        {!hasApiKey && (
          <div className='api-key-banner'>
            For latest prices. Set <code>OILPRICEAPI_KEY</code> in{' '}
            <code>.env</code> for the live catalog and history.
          </div>
        )}
        {catalogError && (
          <div className='api-key-banner'>
            Live catalog unavailable: {catalogError}
          </div>
        )}
        <TickerTape codes={codes} colors={colors} />
        <main className='app-content'>
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

export default function LayoutRoute({ loaderData }: Route.ComponentProps) {
  return (
    <CatalogProvider commodities={loaderData.commodities}>
      <WatchlistProvider>
        <Shell
          hasApiKey={loaderData.hasApiKey}
          catalogError={loaderData.catalogError}
        />
      </WatchlistProvider>
    </CatalogProvider>
  );
}
