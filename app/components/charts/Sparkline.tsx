import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import type { HistoryPoint } from '../../data/priceFormat';

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

  const gradientId = `spark-${color.replace('#', '')}`;
  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.1 || 1;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width='100%' height='100%'>
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={color} stopOpacity={0.35} />
              <stop offset='100%' stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis hide domain={[min - pad, max + pad]} />
          <Area
            type='linear'
            dataKey='price'
            stroke={color}
            strokeWidth={1.75}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
