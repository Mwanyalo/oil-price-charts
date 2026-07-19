import { useLiveData } from '../../context/dataProvider';
import { useCatalog } from '../../context/catalog';
import { formatPrice, type HistoryPoint } from '../../data/priceFormat';

interface LatestResponse {
  updatedAt: string;
  prices: Record<string, HistoryPoint>;
}

interface TickerTapeProps {
  codes: string[];
  colors: Record<string, string>;
  initialPrices?: Record<string, HistoryPoint>;
}

export function TickerTape({ codes, colors, initialPrices }: TickerTapeProps) {
  const { byCode } = useCatalog();
  const { data } = useLiveData<LatestResponse>(
    'latest',
    { codes },
    {
      live: { enabled: true, intervalMs: 5 * 60 * 1000 },
      initialData: initialPrices
        ? { updatedAt: new Date().toISOString(), prices: initialPrices }
        : undefined,
    },
  );

  if (codes.length === 0) return null;
  const latest = data?.prices ?? {};
  const items = [...codes, ...codes];

  return (
    <div className='ticker'>
      <div className='ticker-track'>
        {items.map((code, i) => {
          const meta = byCode[code];
          const point = latest[code];
          return (
            <span key={`${code}-${i}`} className='ticker-item'>
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: colors[code],
                  display: 'inline-block',
                }}
              />
              {meta?.name || code}
              <strong style={{ fontFamily: 'var(--font-mono)' }}>
                {point ? formatPrice(point.price, meta?.currency) : ''}
              </strong>
            </span>
          );
        })}
      </div>
    </div>
  );
}
