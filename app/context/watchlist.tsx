import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useCatalog } from './catalog';

const STORAGE_KEY = 'watchlist:codes';
const MAX_SIZE = 6;
interface WatchlistState {
  codes: string[];
  isTracked: (code: string) => boolean;
  toggle: (code: string) => void;
  untrack: (code: string) => void;
  atLimit: boolean;
  maxSize: number;
}
const WatchlistContext = createContext<WatchlistState | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { commodities, byCode } = useCatalog();
  const [codes, setCodes] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const parsed = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY) || '[]',
      );
      if (Array.isArray(parsed))
        setCodes(
          parsed.filter((code): code is string => typeof code === 'string'),
        );
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!commodities.length) return;
    setCodes((current) => {
      const valid = current.filter((code) => byCode[code]);
      return valid.length
        ? valid
        : commodities.slice(0, 3).map((commodity) => commodity.code);
    });
  }, [commodities, byCode]);

  useEffect(() => {
    if (hydrated)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  }, [codes, hydrated]);
  const value = useMemo<WatchlistState>(
    () => ({
      codes,
      isTracked: (code) => codes.includes(code),
      atLimit: codes.length >= MAX_SIZE,
      maxSize: MAX_SIZE,
      untrack: (code) =>
        setCodes((current) => current.filter((item) => item !== code)),
      toggle: (code) =>
        setCodes((current) =>
          current.includes(code)
            ? current.filter((item) => item !== code)
            : current.length >= MAX_SIZE
              ? current
              : [...current, code],
        ),
    }),
    [codes],
  );
  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}
export function useWatchlist(): WatchlistState {
  const context = useContext(WatchlistContext);
  if (!context)
    throw new Error('useWatchlist must be used within WatchlistProvider');
  return context;
}
