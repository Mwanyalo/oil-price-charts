import { Form, useNavigation, useSubmit } from 'react-router';
import type { Route } from './+types/_layout.history';
import { TrendChart } from '../components/charts/TrendChart';
import { useWatchlist } from '../context/watchlist';
import { useCatalog } from '../context/catalog';
import { useLiveData } from '../context/dataProvider';
import { buildColorMap } from '../data/catalog';
import {
  seriesChange,
  formatPrice,
  formatPercent,
  type HistoryPoint,
  type PriceRange,
} from '../data/priceFormat';

const RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'past_day', label: '24 hours' },
  { value: 'past_week', label: '7 days' },
  { value: 'past_month', label: '30 days' },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  return {
    code: url.searchParams.get('code') || '',
    range: (url.searchParams.get('range') as PriceRange) || 'past_month',
  };
}

export default function History({ loaderData }: Route.ComponentProps) {
  const { codes } = useWatchlist();
  const { byCode } = useCatalog();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { code, range } = loaderData;
  const selectedCode = code || codes[0] || '';
  const meta = byCode[selectedCode];
  const accent = buildColorMap(codes)[selectedCode] || '#8A97A3';
  const {
    data,
    isLoading: isFetching,
    refresh,
  } = useLiveData<{
    code: string;
    range: string;
    data: HistoryPoint[];
    error?: string;
  }>('series', { code: selectedCode, range }, { live: { enabled: false } });
  const chartData = data?.data ?? [];
  const errorMessage = data?.error;
  const stats = chartData.length
    ? {
        high: Math.max(...chartData.map((point) => point.price)),
        low: Math.min(...chartData.map((point) => point.price)),
        avg:
          chartData.reduce((total, point) => total + point.price, 0) /
          chartData.length,
        changePct: seriesChange(chartData).pct,
      }
    : null;

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
            A single fetch per range change no live polling needed for a
            backward looking view.
          </p>
        </div>
        <Form
          method='get'
          style={{ display: 'flex', gap: 8 }}
          onChange={(event) => submit(event.currentTarget)}
        >
          <select name='code' defaultValue={selectedCode}>
            {codes.map((value) => (
              <option key={value} value={value}>
                {byCode[value]?.name || value}
              </option>
            ))}
          </select>
          <select name='range' defaultValue={range}>
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Form>
      </div>
      {stats && (
        <div
          className='grid grid-stats'
          style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}
        >
          <StatBlock
            label='High'
            value={formatPrice(stats.high, meta?.currency)}
          />
          <StatBlock
            label='Low'
            value={formatPrice(stats.low, meta?.currency)}
          />
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
      )}
      <div
        className='card'
        style={{ opacity: navigation.state !== 'idle' ? 0.6 : 1 }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
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
            <h3 style={{ fontSize: '1rem' }}>
              {meta?.name || selectedCode} —{' '}
              {RANGE_OPTIONS.find((option) => option.value === range)?.label}
            </h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className='mono muted' style={{ fontSize: '0.72rem' }}>
              ON DEMAND
            </span>
            <button
              className='btn btn-outline'
              onClick={() => refresh()}
              disabled={isFetching}
            >
              {isFetching ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        {errorMessage ? (
          <p className='muted' style={{ fontSize: '0.85rem' }}>
            {errorMessage}
          </p>
        ) : (
          <TrendChart
            data={chartData}
            color={accent}
            currency={meta?.currency}
            height={320}
          />
        )}
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
