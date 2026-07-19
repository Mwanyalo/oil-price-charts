import { useEffect, useState } from 'react';
import type { Route } from './+types/_layout._index';
import { StatCard } from '../components/ui/StatCard';
import { TrendChart } from '../components/charts/TrendChart';
import { LiveBadge } from '../components/ui/LiveBadge';
import { useWatchlist } from '../context/watchlist';
import { useLiveData } from '../context/dataProvider';
import { buildColorMap, type Commodity } from '../data/catalog';
import { useCatalog } from '../context/catalog';
import { seriesChange, type HistoryPoint } from '../data/priceFormat';

interface SeriesResponse {
  code: string;
  range: string;
  data: HistoryPoint[];
  error?: string;
}

export async function loader({}: Route.LoaderArgs) {
  return { series: {} as Record<string, HistoryPoint[]> };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { codes, untrack } = useWatchlist();
  const { byCode } = useCatalog();
  const colorMap = buildColorMap(codes);
  const [focused, setFocused] = useState(codes[0]);

  useEffect(() => {
    if (!codes.includes(focused)) setFocused(codes[0]);
  }, [codes, focused]);

  if (!codes.length) {
    return (
      <div>
        <h1 style={{ fontSize: '1.5rem' }}>Dashboard</h1>
        <p className='muted'>Waiting for the live OilPriceAPI catalog.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem' }}>Dashboard</h1>
        <p className='muted' style={{ fontSize: '0.85rem', marginTop: 4 }}>
          Your watchlist refreshes every 20s. Tap a card to change the chart
          below and manage what's tracked from Markets.
        </p>
      </div>

      <div className='grid grid-3'>
        {codes.map((code) => (
          <LiveStatCard
            key={code}
            code={code}
            accent={colorMap[code] || '#8A97A3'}
            isFocused={focused === code}
            onFocus={() => setFocused(code)}
            onRemove={codes.length > 1 ? () => untrack(code) : undefined}
            initialSeries={loaderData.series[code]}
            meta={byCode[code]}
          />
        ))}
      </div>

      <FocusedChart
        code={focused}
        accent={colorMap[focused] || '#8A97A3'}
        initialSeries={loaderData.series[focused]}
        meta={byCode[focused]}
      />
    </div>
  );
}

function LiveStatCard({
  code,
  accent,
  isFocused,
  onFocus,
  onRemove,
  initialSeries,
  meta,
}: {
  code: string;
  accent: string;
  isFocused: boolean;
  onFocus: () => void;
  onRemove?: () => void;
  initialSeries?: HistoryPoint[];
  meta?: Commodity;
}) {
  const { data, error } = useLiveData<SeriesResponse>(
    'series',
    { code, range: 'past_day' },
    {
      live: { enabled: true, intervalMs: 2 * 60 * 1000 },
      initialData: initialSeries
        ? { code, range: 'past_day', data: initialSeries }
        : undefined,
    },
  );

  const series = data?.data;
  const change = seriesChange(series);
  const last = series?.[series.length - 1];
  const errorMessage =
    data?.error || (error instanceof Error ? error.message : undefined);

  return (
    <StatCard
      label={meta?.name || code}
      accent={accent}
      price={last?.price}
      currency={meta?.currency}
      unit={meta?.unit}
      changePct={series?.length ? change.pct : null}
      sparkline={series}
      isActive={isFocused}
      onClick={onFocus}
      onRemove={onRemove}
      note={errorMessage}
    />
  );
}

function FocusedChart({
  code,
  accent,
  initialSeries,
  meta,
}: {
  code: string;
  accent: string;
  initialSeries?: HistoryPoint[];
  meta?: Commodity;
}) {
  const { data, error, lastUpdated } = useLiveData<SeriesResponse>(
    'series',
    { code, range: 'past_day' },
    {
      live: { enabled: true, intervalMs: 60 * 1000 },
      initialData: initialSeries
        ? { code, range: 'past_day', data: initialSeries }
        : undefined,
    },
  );

  const errorMessage =
    data?.error || (error instanceof Error ? error.message : undefined);

  return (
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
              background: accent,
            }}
          />
          <h3 style={{ fontSize: '1rem' }}>{meta?.name || code} trend</h3>
        </div>
        <LiveBadge
          live
          lastUpdated={lastUpdated ? new Date(lastUpdated).toISOString() : null}
        />
      </div>
      {errorMessage ? (
        <p className='muted' style={{ fontSize: '0.8rem' }}>
          {errorMessage}
        </p>
      ) : (
        <TrendChart
          data={data?.data}
          color={accent}
          currency={meta?.currency}
        />
      )}
    </div>
  );
}
