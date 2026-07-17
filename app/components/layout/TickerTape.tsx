import { CATALOG_BY_CODE } from '../../data/catalog';
import { formatPrice } from '../../data/utils';
import type { HistoryPoint } from '../../data/api';

interface TickerTapeProps {
  codes: string[];
  latest: Record<string, HistoryPoint>;
  colors: Record<string, string>;
}

export function TickerTape({ codes, latest, colors }: TickerTapeProps) {
  if (codes.length === 0) return null;
  const items = [...codes, ...codes];

  return (
    <div className='ticker'>
      <div className='ticker-track'>
        {items.map((code, i) => {
          const meta = CATALOG_BY_CODE[code];
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
                {point ? formatPrice(point.price, meta?.currency) : '—'}
              </strong>
            </span>
          );
        })}
      </div>
    </div>
  );
}
