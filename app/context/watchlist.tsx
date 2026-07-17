import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_WATCHLIST } from '../data/catalog';

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
  const [codes, setCodes] = useState<string[]>(DEFAULT_WATCHLIST);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setCodes(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
    } catch {
      //private mode
    }
  }, [codes]);

  const value = useMemo<WatchlistState>(() => {
    const isTracked = (code: string) => codes.includes(code);
    return {
      codes,
      isTracked,
      atLimit: codes.length >= MAX_SIZE,
      maxSize: MAX_SIZE,
      untrack: (code: string) =>
        setCodes((prev) =>
          prev.length > 1 ? prev.filter((c) => c !== code) : prev,
        ),
      toggle: (code: string) =>
        setCodes((prev) => {
          if (prev.includes(code)) {
            return prev.length > 1 ? prev.filter((c) => c !== code) : prev;
          }
          if (prev.length >= MAX_SIZE) return prev;
          return [...prev, code];
        }),
    };
  }, [codes]);

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistState {
  const ctx = useContext(WatchlistContext);
  if (!ctx)
    throw new Error('useWatchlist must be used within WatchlistProvider');
  return ctx;
}
