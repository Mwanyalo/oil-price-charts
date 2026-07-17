import type { HistoryPoint } from '../../data/api';

interface SparklineProps {
  data?: HistoryPoint[] | null;
  color?: string;
  height?: number;
}

export function Sparkline({
  data,
  color = '#8A97A3',
  height = 44,
}: SparklineProps) {
  if (!data || data.length < 2) return <div style={{ height }} />;

  const width = 240;
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d.price - min) / range) * height;
    return [x, y];
  });

  const linePath = points
    .map(
      ([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`,
    )
    .join(' ');
  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;
  const gradientId = `spark-${color.replace('#', '')}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width='100%'
      height={height}
      preserveAspectRatio='none'
    >
      <defs>
        <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor={color} stopOpacity={0.35} />
          <stop offset='100%' stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} stroke='none' />
      <path d={linePath} fill='none' stroke={color} strokeWidth={1.75} />
    </svg>
  );
}
