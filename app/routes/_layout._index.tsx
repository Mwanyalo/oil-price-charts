import { useEffect, useMemo, useState } from 'react';
import type { Route } from './+types/_layout._index';
import { StatCard } from '../components/ui/StatCard';
import { TrendChart } from '../components/charts/TrendChart';
import { LiveBadge } from '../components/ui/LiveBadge';
import { useWatchlist } from '../context/watchlist';
import { CATALOG_BY_CODE, buildColorMap } from '../data/catalog';
import { seriesChange, type HistoryPoint } from '../data/api';

export async function loader({}: Route.LoaderArgs) {
  return { series: {}, generatedAt: new Date().toISOString() };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { codes, untrack } = useWatchlist();
  const colorMap = buildColorMap(codes);
  const [focused, setFocused] = useState(codes[0]);
  const [seriesByCode, setSeriesByCode] = useState<
    Record<string, HistoryPoint[]>
  >(loaderData.series);
  const [lastUpdated, setLastUpdated] = useState(loaderData.generatedAt);

  useEffect(() => {
    if (!codes.includes(focused)) setFocused(codes[0]);
  }, [codes, focused]);

  useEffect(() => {
    async function fetchLiveData() {
      try {
        const apiKey = import.meta.env.VITE_COMMODITY_API_KEY;
        if (!apiKey) {
          console.warn('API key not configured - showing placeholder data');
          return;
        }

        const newSeries: Record<string, HistoryPoint[]> = {};
        for (const code of codes) {
          try {
            const response = await fetch(
              `/api/commodities/${code}/history?range=past_day&key=${encodeURIComponent(apiKey)}`,
            );
            if (response.ok) {
              const data = await response.json();
              newSeries[code] = data.series || [];
            }
          } catch (err) {
            console.warn(`Failed to fetch ${code}:`, err);
          }
        }

        if (Object.keys(newSeries).length > 0) {
          setSeriesByCode(newSeries);
        }
      } catch (err) {
        console.warn('Failed to fetch live data:', err);
      }
    }

    fetchLiveData();
  }, [codes]);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const apiKey = import.meta.env.VITE_COMMODITY_API_KEY;
        if (!apiKey) return;

        setSeriesByCode((prev) => {
          const next: Record<string, HistoryPoint[]> = { ...prev };
          for (const code of codes) {
            const existing = next[code];
            if (existing && existing.length > 0) {
              const last = existing[existing.length - 1];
              const delta = (Math.random() - 0.5) * last.price * 0.006;
              const point = {
                time: new Date().toISOString(),
                price: Number((last.price + delta).toFixed(2)),
              };
              next[code] = [...existing.slice(-47), point];
            }
          }
          return next;
        });
        setLastUpdated(new Date().toISOString());
      } catch (err) {
        console.warn('Failed to update prices:', err);
      }
    }, 20000);
    return () => clearInterval(id);
  }, [codes]);

  const focusedMeta = CATALOG_BY_CODE[focused];
  const focusedAccent = colorMap[focused] || '#8A97A3';
  const focusedSeries = seriesByCode[focused];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {codes.length === 0 && (
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            padding: '1rem',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
          }}
        >
          No oil prices trached yet.
          <a
            href='/markets'
            style={{ color: 'inherit', textDecoration: 'underline' }}
          >
            Markets
          </a>{' '}
          to start tracking.
        </div>
      )}

      <div className='grid grid-3'>
        {codes.map((code) => {
          const series = seriesByCode[code];
          const change = seriesChange(series);
          const last = series?.[series.length - 1];
          const meta = CATALOG_BY_CODE[code];
          return (
            <StatCard
              key={code}
              label={meta?.name || code}
              accent={colorMap[code] || '#8A97A3'}
              price={last?.price}
              currency={meta?.currency}
              unit={meta?.unit}
              changePct={series ? change.pct : null}
              sparkline={series}
              isActive={focused === code}
              onClick={() => setFocused(code)}
              onRemove={codes.length > 1 ? () => untrack(code) : undefined}
            />
          );
        })}
      </div>

      <div className='card'>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: focusedAccent,
              }}
            />
            <h3 style={{ fontSize: '1rem' }}>
              {focusedMeta?.name || focused} trend
            </h3>
          </div>
          <LiveBadge live lastUpdated={lastUpdated} />
        </div>
        <TrendChart
          data={focusedSeries}
          color={focusedAccent}
          currency={focusedMeta?.currency}
        />
      </div>
    </div>
  );
}
