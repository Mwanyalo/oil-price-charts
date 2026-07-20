import { Outlet } from 'react-router';
import { Box, Flex } from '@chakra-ui/react';
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
    <Flex align='stretch' minHeight='100vh'>
      <Sidebar />
      <Box flex={1} minWidth={0}>
        <TopBar lastUpdated={null} />
        {!hasApiKey && (
          <Box
            fontSize='0.78rem'
            color='var(--text-muted)'
            bg='var(--surface)'
            borderBottom='1px solid var(--border)'
            padding={{ base: '0.6rem 1.5rem', md: '0.6rem 2rem' }}
          >
            For latest prices. Set{' '}
            <Box
              as='code'
              fontFamily='var(--font-mono)'
              bg='var(--border)'
              padding='1px 5px'
              borderRadius='4px'
              color='var(--text-primary)'
            >
              OILPRICEAPI_KEY
            </Box>{' '}
            in{' '}
            <Box
              as='code'
              fontFamily='var(--font-mono)'
              bg='var(--border)'
              padding='1px 5px'
              borderRadius='4px'
              color='var(--text-primary)'
            >
              .env
            </Box>{' '}
            for the live catalog and history.
          </Box>
        )}
        {catalogError && (
          <Box
            fontSize='0.78rem'
            color='var(--text-muted)'
            bg='var(--surface)'
            borderBottom='1px solid var(--border)'
            padding={{ base: '0.6rem 1.5rem', md: '0.6rem 2rem' }}
          >
            Live catalog unavailable: {catalogError}
          </Box>
        )}
        <TickerTape codes={codes} colors={colors} />
        <Box
          as='main'
          margin='0 auto'
          padding={{ base: '1.5rem', md: '1.5rem 2rem' }}
          paddingBottom={{ base: '84px', md: '2rem' }}
        >
          <Outlet />
        </Box>
      </Box>
      <BottomNav />
    </Flex>
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
