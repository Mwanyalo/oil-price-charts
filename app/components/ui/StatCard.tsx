import { Sparkline } from '../charts/Sparkline';
import { formatPrice, formatPercent } from '../../data/utils';
import type { HistoryPoint } from '../../data/api';

interface StatCardProps {
  label: string;
  price?: number | null;
  currency?: string;
  unit?: string;
  changePct?: number | null;
  sparkline?: HistoryPoint[] | null;
  accent: string;
  isActive?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
}

export function StatCard({
  label,
  price,
  currency,
  unit,
  changePct,
  sparkline,
  accent,
  isActive,
  onClick,
  onRemove,
}: StatCardProps) {
  const up = (changePct ?? 0) >= 0;

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className='card'
      style={{
        position: 'relative',
        borderColor: isActive ? accent : undefined,
        background: isActive ? `${accent}0f` : undefined,
        cursor: onClick ? 'pointer' : undefined,
        textAlign: 'left',
      }}
    >
      {onRemove && (
        <button
          aria-label={`Stop tracking ${label}`}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className='icon-btn'
          style={{ position: 'absolute', top: 10, right: 10 }}
        >
          ✕
        </button>
      )}

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'start',
          marginBottom: 4,
          paddingRight: onRemove ? 24 : 0,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: accent,
              flexShrink: 0,
            }}
          />
          <span
            style={{ fontWeight: 600, fontSize: '0.85rem', color: '#8b8b90' }}
          >
            {label}
          </span>
        </span>
        {changePct != null && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: up ? '#5fa87c' : '#c96b6b',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            {up ? '▲' : '▼'} {formatPercent(changePct)}
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: '1.5rem',
          lineHeight: 1.2,
        }}
      >
        {formatPrice(price, currency)}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: '0.75rem', color: '#8b8b90' }}>
          per {unit || 'unit'}
        </span>
        {isActive && (
          <span
            style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: accent,
            }}
          >
            Charting
          </span>
        )}
      </div>

      <Sparkline data={sparkline} color={accent} />
    </div>
  );
}
