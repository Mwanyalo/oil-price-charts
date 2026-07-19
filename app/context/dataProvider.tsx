import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { DATASOURCES, type DataSourceId } from '../data/datasources';

interface Snapshot<T = any> {
  data: T | undefined;
  error: unknown;
  isLoading: boolean;
  updatedAt: number | null;
}

interface Entry {
  sourceId: DataSourceId;
  params: unknown;
  snapshot: Snapshot;
  listeners: Set<() => void>;
  /** subscriberId -> requested poll interval in ms (0 = no polling, just fetch once) */
  subscribers: Map<string, number>;
  timer: ReturnType<typeof setInterval> | null;
  inFlight: Promise<void> | null;
}

const GLOBAL_POLLING_KEY = 'live-polling:enabled';

/**
 * Owns every live data key: who's fetched, who's polling, and at what rate.
 * Components never fetch directly — they declare a datasource id + params and
 * their own live preference, and this store dedupes the rest.
 *
 * Two cross-cutting controls sit above individual subscriptions:
 *  - tab visibility: polling pauses while the tab is hidden, and does one
 *    catch-up fetch per active key when it becomes visible again
 *  - a global on/off switch (Settings), for killing all polling at once —
 *    useful on a metered free-tier API budget
 */
class DataStore {
  private entries = new Map<string, Entry>();
  private pageVisible = true;
  private globalPollingEnabled = true;
  private globalListeners = new Set<() => void>();

  constructor() {
    if (typeof document !== 'undefined') {
      this.pageVisible = document.visibilityState !== 'hidden';
      document.addEventListener('visibilitychange', () => {
        const wasVisible = this.pageVisible;
        this.pageVisible = document.visibilityState !== 'hidden';
        if (this.pageVisible && !wasVisible) {
          // catch up anything that was paused, then resume normal cadence
          this.entries.forEach((entry, key) => {
            if (this.effectiveInterval(entry) > 0)
              this.fetchNow(entry.sourceId, key, entry.params);
          });
        }
        this.rescheduleAll();
      });
    }
  }

  private ensure(key: string, sourceId: DataSourceId, params: unknown): Entry {
    let entry = this.entries.get(key);
    if (!entry) {
      entry = {
        sourceId,
        params,
        snapshot: {
          data: undefined,
          error: undefined,
          isLoading: false,
          updatedAt: null,
        },
        listeners: new Set(),
        subscribers: new Map(),
        timer: null,
        inFlight: null,
      };
      this.entries.set(key, entry);
    }
    return entry;
  }

  private patch(key: string, patch: Partial<Snapshot>) {
    const entry = this.entries.get(key);
    if (!entry) return;
    entry.snapshot = { ...entry.snapshot, ...patch };
    entry.listeners.forEach((notify) => notify());
  }

  /** Seed a key with SSR/loader data so the first render never re-fetches. */
  seed(key: string, sourceId: DataSourceId, params: unknown, data: unknown) {
    const entry = this.ensure(key, sourceId, params);
    if (entry.snapshot.data === undefined) {
      this.patch(key, { data, updatedAt: Date.now() });
    }
  }

  getSnapshot(key: string, sourceId: DataSourceId, params: unknown): Snapshot {
    return this.ensure(key, sourceId, params).snapshot;
  }

  async fetchNow(sourceId: DataSourceId, key: string, params: unknown) {
    const entry = this.entries.get(key);
    if (!entry || entry.inFlight) return entry?.inFlight;

    const config = DATASOURCES[sourceId];
    if (!config) return;

    this.patch(key, { isLoading: true });
    const request = (async () => {
      try {
        const url = config.buildUrl(params as never);
        const headers =
          'headers' in config
            ? (config.headers as HeadersInit | undefined)
            : undefined;
        const res = await fetch(url, { headers });
        const json = await res.json().catch(() => null);
        if (!res.ok && !json) {
          throw new Error(`${sourceId} request failed: ${res.status}`);
        }
        this.patch(key, {
          data: json,
          error: undefined,
          isLoading: false,
          updatedAt: Date.now(),
        });
      } catch (error) {
        this.patch(key, { error, isLoading: false });
      } finally {
        entry.inFlight = null;
      }
    })();
    entry.inFlight = request;
    return request;
  }

  /** The fastest interval any subscriber asked for, or 0 if polling is paused/off/empty. */
  private effectiveInterval(entry: Entry): number {
    if (!this.globalPollingEnabled || !this.pageVisible) return 0;
    const active = Array.from(entry.subscribers.values()).filter(
      (ms) => ms > 0,
    );
    return active.length ? Math.min(...active) : 0;
  }

  private reschedule(key: string) {
    const entry = this.entries.get(key);
    if (!entry) return;
    if (entry.timer) {
      clearInterval(entry.timer);
      entry.timer = null;
    }
    const interval = this.effectiveInterval(entry);
    if (interval <= 0) return;
    entry.timer = setInterval(
      () => this.fetchNow(entry.sourceId, key, entry.params),
      interval,
    );
  }

  private rescheduleAll() {
    this.entries.forEach((_entry, key) => this.reschedule(key));
  }

  subscribe(
    sourceId: DataSourceId,
    key: string,
    params: unknown,
    subscriberId: string,
    intervalMs: number,
    onChange: () => void,
  ) {
    const entry = this.ensure(key, sourceId, params);
    entry.listeners.add(onChange);
    entry.subscribers.set(subscriberId, intervalMs);

    if (entry.snapshot.data === undefined && !entry.inFlight) {
      this.fetchNow(sourceId, key, params);
    }
    this.reschedule(key);

    return () => {
      entry.listeners.delete(onChange);
      entry.subscribers.delete(subscriberId);
      this.reschedule(key);
    };
  }

  setGlobalPolling(enabled: boolean) {
    this.globalPollingEnabled = enabled;
    try {
      window.localStorage.setItem(GLOBAL_POLLING_KEY, enabled ? '1' : '0');
    } catch {
      // ignore
    }
    if (enabled) {
      // catch up everything that has active subscribers
      this.entries.forEach((entry, key) => {
        if (Array.from(entry.subscribers.values()).some((ms) => ms > 0)) {
          this.fetchNow(entry.sourceId, key, entry.params);
        }
      });
    }
    this.rescheduleAll();
    this.globalListeners.forEach((l) => l());
  }

  isGlobalPollingEnabled() {
    return this.globalPollingEnabled;
  }

  initGlobalPollingFromStorage() {
    try {
      const stored = window.localStorage.getItem(GLOBAL_POLLING_KEY);
      if (stored !== null) {
        this.globalPollingEnabled = stored === '1';
        this.rescheduleAll();
      }
    } catch {
      // ignore
    }
  }

  subscribeGlobalPolling(onChange: () => void) {
    this.globalListeners.add(onChange);
    return () => this.globalListeners.delete(onChange);
  }
}

const DataStoreContext = createContext<DataStore | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<DataStore | null>(null);
  if (!storeRef.current) storeRef.current = new DataStore();

  useEffect(() => {
    storeRef.current?.initGlobalPollingFromStorage();
  }, []);

  return (
    <DataStoreContext.Provider value={storeRef.current}>
      {children}
    </DataStoreContext.Provider>
  );
}

function useStore(): DataStore {
  const store = useContext(DataStoreContext);
  if (!store) throw new Error('useLiveData must be used within <DataProvider>');
  return store;
}

export interface LiveConfig {
  enabled: boolean;
  /** Poll interval in ms while enabled. Ignored when enabled is false. */
  intervalMs?: number;
}

export interface UseLiveDataOptions<T> {
  live?: LiveConfig;
  /** SSR/loader data to seed the cache with, so first paint needs no fetch. */
  initialData?: T;
}

/**
 * Subscribe to a named datasource. No fetcher to write — the provider resolves
 * `sourceId` against the registry and fetches internally. Multiple components
 * requesting the same sourceId+params share one cached entry and one poll
 * timer (running at the fastest interval any of them asked for), and polling
 * automatically pauses when the tab is hidden or the global toggle is off.
 */
export function useLiveData<T = unknown, P = unknown>(
  sourceId: DataSourceId,
  params: P,
  options: UseLiveDataOptions<T> = {},
) {
  const store = useStore();
  const subscriberId = useId();
  const key = `${sourceId}:${JSON.stringify(params)}`;

  const seededKeys = useRef<Set<string>>(new Set());
  if (options.initialData !== undefined && !seededKeys.current.has(key)) {
    store.seed(key, sourceId, params, options.initialData);
    seededKeys.current.add(key);
  }

  const live = options.live ?? { enabled: false };
  const intervalMs = live.enabled ? (live.intervalMs ?? 15000) : 0;

  const subscribe = useCallback(
    (onChange: () => void) =>
      store.subscribe(
        sourceId,
        key,
        params,
        subscriberId,
        intervalMs,
        onChange,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, sourceId, key, subscriberId, intervalMs],
  );
  const getSnapshot = useCallback(
    () => store.getSnapshot(key, sourceId, params),
    [store, key, sourceId],
  );

  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return {
    data: snapshot.data as T | undefined,
    error: snapshot.error,
    isLoading: snapshot.isLoading,
    lastUpdated: snapshot.updatedAt,
    refresh: () => store.fetchNow(sourceId, key, params),
  };
}

/** Global on/off switch for all live polling, e.g. a Settings toggle. */
export function useGlobalLivePolling() {
  const store = useStore();
  const subscribe = useCallback(
    (onChange: () => void) => store.subscribeGlobalPolling(onChange),
    [store],
  );
  const getSnapshot = useCallback(
    () => store.isGlobalPollingEnabled(),
    [store],
  );
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return {
    enabled,
    setEnabled: (value: boolean) => store.setGlobalPolling(value),
  };
}
