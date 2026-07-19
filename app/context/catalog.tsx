import { createContext, useContext, useMemo } from 'react';
import type { Commodity } from '../data/catalog';
import { useLiveData } from './dataProvider';

interface CatalogResponse {
  commodities: Commodity[];
  source: 'oilpriceapi' | 'unavailable';
  error?: string;
}

interface CatalogState {
  commodities: Commodity[];
  byCode: Record<string, Commodity>;
  error?: string;
  isLoading: boolean;
}

const CatalogContext = createContext<CatalogState>({
  commodities: [],
  byCode: {},
  isLoading: false,
});

export function CatalogProvider({
  commodities: initialCommodities = [],
  children,
}: {
  commodities?: Commodity[];
  children: React.ReactNode;
}) {
  // When SSR could not reach OilPriceAPI, do a client-side retry. This also
  // keeps a fast shell navigation from leaving Markets permanently empty.
  const { data, error, isLoading } = useLiveData<CatalogResponse>(
    'commodities',
    {},
    {
      live: { enabled: false },
      initialData: initialCommodities.length
        ? { commodities: initialCommodities, source: 'oilpriceapi' }
        : undefined,
    },
  );
  const commodities = data?.commodities ?? initialCommodities;
  const byCode = useMemo(
    () =>
      Object.fromEntries(
        commodities.map((commodity) => [commodity.code, commodity]),
      ),
    [commodities],
  );
  const catalogError =
    data?.error || (error instanceof Error ? error.message : undefined);
  const value = useMemo(
    () => ({ commodities, byCode, error: catalogError, isLoading }),
    [commodities, byCode, catalogError, isLoading],
  );
  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  return useContext(CatalogContext);
}
