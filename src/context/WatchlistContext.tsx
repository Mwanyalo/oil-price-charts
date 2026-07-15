import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CommodityCode } from '../types/oil';

const STORAGE_KEY = 'crude-signal:watchlist';
const DEFAULT_WATCHLIST: CommodityCode[] = [
  'WTI_USD',
  'BRENT_CRUDE_USD',
  'NATURAL_GAS_USD',
];
const MAX_WATCHLIST = 6;

const readStored = (): CommodityCode[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WATCHLIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
};

interface WatchlistContextValue {
  codes: CommodityCode[];
  isTracked: (code: CommodityCode) => boolean;
  track: (code: CommodityCode) => void;
  untrack: (code: CommodityCode) => void;
  toggle: (code: CommodityCode) => void;
  atLimit: boolean;
  maxSize: number;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

export const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const [codes, setCodes] = useState<CommodityCode[]>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch {
      // storage unavailable (private browsing etc.) — fine, just won't persist
    }
  }, [codes]);

  const track = useCallback((code: CommodityCode) => {
    setCodes((prev) =>
      prev.includes(code) || prev.length >= MAX_WATCHLIST
        ? prev
        : [...prev, code],
    );
  }, []);

  const untrack = useCallback((code: CommodityCode) => {
    setCodes((prev) =>
      prev.length <= 1 ? prev : prev.filter((c) => c !== code),
    );
  }, []);

  const toggle = useCallback(
    (code: CommodityCode) =>
      setCodes((prev) =>
        prev.includes(code)
          ? prev.filter((c) => c !== code)
          : prev.length >= MAX_WATCHLIST
            ? prev
            : [...prev, code],
      ),
    [],
  );

  const value = useMemo<WatchlistContextValue>(
    () => ({
      codes,
      isTracked: (code) => codes.includes(code),
      track,
      untrack,
      toggle,
      atLimit: codes.length >= MAX_WATCHLIST,
      maxSize: MAX_WATCHLIST,
    }),
    [codes, track, untrack, toggle],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export const useWatchlist = (): WatchlistContextValue => {
  const ctx = useContext(WatchlistContext);
  if (!ctx)
    throw new Error('useWatchlist must be used within a <WatchlistProvider>');
  return ctx;
};
