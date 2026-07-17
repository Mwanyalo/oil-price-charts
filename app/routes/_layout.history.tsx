import { Form, useNavigation, useSubmit } from 'react-router';
import type { Route } from './+types/_layout.history';
import { useEffect, useState } from 'react';
import { TrendChart } from '../components/charts/TrendChart';
import { useWatchlist } from '../context/watchlist';
import {
  CATALOG_BY_CODE,
  DEFAULT_WATCHLIST,
  buildColorMap,
} from '../data/catalog';
import { seriesChange, type HistoryPoint } from '../data/api';
import { formatPrice, formatPercent } from '../data/utils';

const RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'past_day', label: '24 hours' },
  { value: 'past_week', label: '7 days' },
  { value: 'past_month', label: '30 days' },
];

export type PriceRange = 'past_day' | 'past_week' | 'past_month';

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code') || DEFAULT_WATCHLIST[0];
  const range = (url.searchParams.get('range') as PriceRange) || 'past_month';

  return {
    code,
    range,
    data: [],
    stats: {
      high: 0,
      low: 0,
      avg: 0,
      changePct: 0,
    },
  };
}

export default function History({ loaderData }: Route.ComponentProps) {
  const { codes } = useWatchlist();
  const submit = useSubmit();
  const navigation = useNavigation();
  const colorMap = buildColorMap(codes);
  const { code, range } = loaderData;
  const [data, setData] = useState<HistoryPoint[]>(loaderData.data);
  const [stats, setStats] = useState(loaderData.stats);
  const [isApiError, setIsApiError] = useState(false);

  const meta = CATALOG_BY_CODE[code];
  const accent = colorMap[code] || '#8A97A3';
  const isLoading = navigation.state !== 'idle' || data.length === 0;

  useEffect(() => {
    async function fetchData() {
      try {
        setIsApiError(false);
        const apiKey = import.meta.env.VITE_COMMODITY_API_KEY;

        if (!apiKey) {
          setIsApiError(true);
          return;
        }

        const response = await fetch(
          `/api/commodities/${code}/history?range=${range}&key=${encodeURIComponent(apiKey)}`,
        );

        if (!response.ok) {
          console.warn(`Failed to fetch data: ${response.statusText}`);
          setIsApiError(true);
          return;
        }

        const apiData = await response.json();
        const series = apiData.series || [];
        setData(series);

        if (series.length > 0) {
          const prices = series.map((d) => d.price);
          const change = seriesChange(series);
          setStats({
            high: Math.max(...prices),
            low: Math.min(...prices),
            avg: prices.reduce((a, b) => a + b, 0) / prices.length,
            changePct: change.pct,
          });
        }
      } catch (err) {
        console.warn('Failed to fetch history data:', err);
        setIsApiError(true);
      }
    }

    fetchData();
  }, [code, range]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.5rem' }}>History</h1>
          <p className='muted' style={{ fontSize: '0.85rem', marginTop: 4 }}>
            A single server fetch per selection — the URL is the source of
            truth, so this page works without JavaScript too.
          </p>
        </div>

        <Form
          method='get'
          style={{ display: 'flex', gap: 8 }}
          onChange={(e) => submit(e.currentTarget)}
        >
          <select name='code' defaultValue={code}>
            {(codes.length ? codes : DEFAULT_WATCHLIST).map((c) => (
              <option key={c} value={c}>
                {CATALOG_BY_CODE[c]?.name || c}
              </option>
            ))}
          </select>
          <select name='range' defaultValue={range}>
            {RANGE_OPTIONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </Form>
      </div>

      <div
        className='grid grid-stats'
        style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
      >
        <StatBlock
          label='High'
          value={formatPrice(stats.high, meta?.currency)}
        />
        <StatBlock label='Low' value={formatPrice(stats.low, meta?.currency)} />
        <StatBlock
          label='Average'
          value={formatPrice(stats.avg, meta?.currency)}
        />
        <StatBlock
          label='Change'
          value={formatPercent(stats.changePct)}
          tone={stats.changePct >= 0 ? 'up' : 'down'}
        />
      </div>

      <div className='card' style={{ opacity: isLoading ? 0.6 : 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: accent,
            }}
          />
          <h3 style={{ fontSize: '1rem' }}>
            {meta?.name || code} —{' '}
            {RANGE_OPTIONS.find((r) => r.value === range)?.label}
          </h3>
        </div>
        <TrendChart
          data={data}
          color={accent}
          currency={meta?.currency}
          height={320}
        />
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down';
}) {
  const color =
    tone === 'up' ? '#5fa87c' : tone === 'down' ? '#c96b6b' : undefined;
  return (
    <div className='card'>
      <div className='muted' style={{ fontSize: '0.72rem', marginBottom: 4 }}>
        {label}
      </div>
      <div
        className='mono'
        style={{ fontWeight: 700, fontSize: '1.05rem', color }}
      >
        {value}
      </div>
    </div>
  );
}
