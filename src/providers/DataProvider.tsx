import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface LiveConfig {
  enabled: boolean;
  intervalMs?: number;
}

interface StoreEntry<T = unknown> {
  data: T | null;
  error: string | null;
  loading: boolean;
  lastUpdated: number | null;
}

type Store = Record<string, StoreEntry>;

interface RegistryEntry {
  fetcher: () => Promise<unknown>;
  timer: ReturnType<typeof setInterval> | null;
  subscribers: Map<string, Required<LiveConfig>>;
}

interface DataContextValue {
  store: Store;
  subscribe: (
    key: string,
    fetcher: () => Promise<unknown>,
    subscriberId: string,
    live?: LiveConfig,
  ) => () => void;
  refetch: (key: string) => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [store, setStore] = useState<Store>({});
  const registry = useRef<Record<string, RegistryEntry>>({});

  const patchEntry = useCallback((key: string, patch: Partial<StoreEntry>) => {
    setStore((prev) => ({
      ...prev,
      [key]: { ...(prev[key] as StoreEntry), ...patch } as StoreEntry,
    }));
  }, []);

  const fetchNow = useCallback(
    async (key: string) => {
      const entry = registry.current[key];
      if (!entry) return;
      patchEntry(key, { loading: true });
      try {
        const data = await entry.fetcher();
        patchEntry(key, {
          data,
          error: null,
          loading: false,
          lastUpdated: Date.now(),
        });
      } catch (err) {
        patchEntry(key, {
          error: err instanceof Error ? err.message : 'Request failed',
          loading: false,
        });
      }
    },
    [patchEntry],
  );

  const recomputeTimer = useCallback(
    (key: string) => {
      const entry = registry.current[key];
      if (!entry) return;

      const activeIntervals = Array.from(entry.subscribers.values())
        .filter((s) => s.enabled && s.intervalMs > 0)
        .map((s) => s.intervalMs);

      const nextIntervalMs = activeIntervals.length
        ? Math.min(...activeIntervals)
        : null;

      if (entry.timer) {
        clearInterval(entry.timer);
        entry.timer = null;
      }
      if (nextIntervalMs) {
        entry.timer = setInterval(() => fetchNow(key), nextIntervalMs);
      }
    },
    [fetchNow],
  );

  const subscribe = useCallback(
    (
      key: string,
      fetcher: () => Promise<unknown>,
      subscriberId: string,
      live?: LiveConfig,
    ) => {
      let entry = registry.current[key];
      const isNewSource = !entry;
      if (!entry) {
        entry = { fetcher, subscribers: new Map(), timer: null };
        registry.current[key] = entry;
      } else {
      }

      entry.subscribers.set(subscriberId, {
        enabled: !!live?.enabled,
        intervalMs: live?.intervalMs ?? 30000,
      });

      if (isNewSource) fetchNow(key);
      recomputeTimer(key);

      return () => {
        const e = registry.current[key];
        if (!e) return;
        e.subscribers.delete(subscriberId);
        if (e.subscribers.size === 0) {
          if (e.timer) clearInterval(e.timer);
          delete registry.current[key];
        } else {
          recomputeTimer(key);
        }
      };
    },
    [fetchNow, recomputeTimer],
  );

  const value: DataContextValue = { store, subscribe, refetch: fetchNow };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

let idCounter = 0;
const nextId = () => `sub-${++idCounter}`;

export interface UseDataSourceResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  lastUpdated: number | null;
  refetch: () => void;
}

export interface UseDataSourceOptions<T> {
  key: string;
  fetcher: () => Promise<T>;
  live?: LiveConfig;
}

/**
 * @param key - cache key; identical keys share one fetch + timer
 * @param fetcher - returns the data for this key
 * @param live - this consumer's live-mode setting
 */
export const useDataSource = <T,>({
  key,
  fetcher,
  live = { enabled: false, intervalMs: 30000 },
}: UseDataSourceOptions<T>): UseDataSourceResult<T> => {
  const ctx = useContext(DataContext);
  if (!ctx)
    throw new Error('useDataSource must be used within a <DataProvider>');
  const { store, subscribe, refetch } = ctx;
  const idRef = useRef(nextId());
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    const unsubscribe = subscribe(
      key,
      () => fetcherRef.current(),
      idRef.current,
      live,
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, live.enabled, live.intervalMs, subscribe]);

  const entry = (store[key] as StoreEntry<T> | undefined) ?? {
    data: null,
    error: null,
    loading: true,
    lastUpdated: null,
  };
  return {
    ...entry,
    refetch: () => {
      void refetch(key);
    },
  };
};
