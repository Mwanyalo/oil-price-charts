import type { HistoryPoint } from '../../data/api';
import { formatPrice } from '../../data/utils';

interface TrendChartProps {
  data?: HistoryPoint[] | null;
  color?: string;
  currency?: string;
  height?: number;
}

export function TrendChart({
  data,
  color = '#E8672E',
  currency = 'USD',
  height = 220,
}: TrendChartProps) {
  if (!data || data.length < 2) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b6b70',
        }}
      >
        Not enough data
      </div>
    );
  }

  const width = 800;
  const padding = 28;
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const innerH = height - padding * 2;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padding + innerH - ((d.price - min) / range) * innerH;
    return [x, y];
  });

  const linePath = points
    .map(
      ([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`,
    )
    .join(' ');
  const areaPath = `${linePath} L ${width} ${height - padding} L 0 ${height - padding} Z`;
  const gradientId = `trend-${color.replace('#', '')}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width='100%'
        height={height}
        preserveAspectRatio='none'
      >
        <defs>
          <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={color} stopOpacity={0.3} />
            <stop offset='100%' stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line
            key={f}
            x1={0}
            x2={width}
            y1={padding + innerH * f}
            y2={padding + innerH * f}
            stroke='#27272a'
            strokeWidth={1}
          />
        ))}
        <path d={areaPath} fill={`url(#${gradientId})`} stroke='none' />
        <path d={linePath} fill='none' stroke={color} strokeWidth={2} />
      </svg>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#8b8b90',
          marginTop: 4,
        }}
      >
        <span>{formatPrice(min, currency)}</span>
        <span>{formatPrice(max, currency)}</span>
      </div>
    </div>
  );
}
