import type { Commodity } from '../../data/catalog';
import { humanizeCategory } from '../../data/catalog';
import { formatPrice } from '../../data/utils';

interface CommodityCardProps {
  commodity: Commodity;
  tracked: boolean;
  disabled?: boolean;
  disabledReason?: string;
  latestPrice?: number | null;
  onToggle: () => void;
}

export function CommodityCard({
  commodity,
  tracked,
  disabled,
  disabledReason,
  latestPrice,
  onToggle,
}: CommodityCardProps) {
  return (
    <div
      className='card'
      style={{ borderColor: tracked ? '#8f5432' : undefined }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: 6,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {commodity.name}
          </div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#8b8b90',
            }}
          >
            {commodity.code}
          </div>
        </div>
        <span className='badge'>{humanizeCategory(commodity.category)}</span>
      </div>

      {latestPrice != null ? (
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '1.1rem',
            marginBottom: 8,
          }}
        >
          {formatPrice(latestPrice, commodity.currency)}
        </div>
      ) : (
        <p
          style={{
            fontSize: '0.78rem',
            color: '#8b8b90',
            minHeight: 34,
            marginTop: 0,
          }}
        >
          {commodity.description}
        </p>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: 4,
        }}
      >
        <span
          style={{
            fontSize: '0.68rem',
            color: '#8b8b90',
            fontFamily: 'var(--font-mono)',
          }}
        >
          per {commodity.unit}
        </span>
        <button
          className={`btn${tracked ? ' btn-outline' : ''}`}
          onClick={onToggle}
          disabled={disabled}
          title={disabled ? disabledReason : undefined}
        >
          {tracked ? '− Untrack' : '+ Track'}
        </button>
      </div>
    </div>
  );
}
