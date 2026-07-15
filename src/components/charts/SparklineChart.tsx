import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';
import { useToken } from '@chakra-ui/react';
import type { HistoryPoint } from '../../types/oil';

interface SparklineChartProps {
  data?: HistoryPoint[] | null;
  colorToken?: string;
  height?: number;
}

export const SparklineChart = ({
  data,
  colorToken = 'commodity.wti',
  height = 44,
}: SparklineChartProps) => {
  const [color] = useToken('colors', [colorToken]);
  const gradientId = `spark-${colorToken.replace('.', '-')}`;

  if (!data || data.length < 2) return <div style={{ height }} />;

  return (
    <ResponsiveContainer width='100%' height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
            <stop offset='0%' stopColor={color} stopOpacity={0.35} />
            <stop offset='100%' stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <YAxis hide domain={['dataMin', 'dataMax']} />
        <Area
          type='monotone'
          dataKey='price'
          stroke={color}
          strokeWidth={1.75}
          fill={`url(#${gradientId})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
