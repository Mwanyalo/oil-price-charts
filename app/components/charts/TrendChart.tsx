import { useId } from 'react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  CartesianGrid,
  Tooltip,
  XAxis,
} from 'recharts';
import type { HistoryPoint } from '../../data/priceFormat';
import { formatPrice } from '../../data/priceFormat';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { LineLoader } from '../ui/LineLoader';
import { formatClockTime } from '~/data/timeFormart';

interface TrendChartProps {
  data?: HistoryPoint[] | null;
  color?: string;
  currency?: string;
  height?: number;
  loading?: boolean;
}

function formatPointTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(date);
}

function ChartTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: Array<{ payload: HistoryPoint }>;
  currency?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: '6px 8px',
        borderRadius: 6,
        background: 'var(--text-primary)',
        color: 'var(--canvas)',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        whiteSpace: 'nowrap',
      }}
    >
      <strong>{formatPrice(point.price, currency)}</strong>
      <span
        style={{
          opacity: 0.72,
          fontFamily: 'var(--font-body)',
          fontSize: '0.65rem',
        }}
      >
        {formatPointTime(point.time)}
      </span>
    </div>
  );
}

export function TrendChart({
  data,
  color = '#E8672E',
  currency = 'USD',
  height = 220,
  loading = false,
}: TrendChartProps) {
  const rawId = useId();
  const gradientId = `trend-${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const gridColor = useColorModeValue('#E2DFD6', '#1A222B');
  const axisColor = useColorModeValue('#8A97A3', '#5A6A78');

  if (!data || data.length < 2)
    return (
      <Box
        position='relative'
        height={height}
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <LineLoader active={loading} />
        <Text color='textMuted' fontSize='sm'>
          {loading ? 'Loading…' : 'No data yet.'}
        </Text>
      </Box>
    );

  const prices = data.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const pad = (max - min) * 0.05 || 1;

  return (
    <Box position='relative'>
      <LineLoader active={loading} />
      <ResponsiveContainer width='100%' height={height}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 0, bottom: 8, left: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={color} stopOpacity={0.3} />
              <stop offset='100%' stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            stroke={gridColor}
            vertical={false}
            strokeDasharray='3 3'
          />
          <XAxis
            dataKey='time'
            tickFormatter={(t) => formatClockTime(t)}
            tick={{
              fontSize: 11,
              fill: axisColor,
              fontFamily: 'IBM Plex Mono, monospace',
            }}
            tickLine={false}
            axisLine={{ stroke: gridColor }}
            minTickGap={40}
          />
          <YAxis
            domain={['auto', 'auto']}
            tick={{
              fontSize: 11,
              fill: axisColor,
              fontFamily: 'IBM Plex Mono, monospace',
            }}
            tickLine={false}
            axisLine={false}
            width={54}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            content={(props: any) => (
              <ChartTooltip {...props} currency={currency} />
            )}
            cursor={{ stroke: '#8b8b90', strokeDasharray: '4 4' }}
          />
          <Area
            type='linear'
            dataKey='price'
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
            dot={false}
            activeDot={{
              r: 5,
              fill: 'var(--surface)',
              stroke: color,
              strokeWidth: 2.5,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
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
    </Box>
  );
}
