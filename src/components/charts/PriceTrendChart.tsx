import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Text, useToken, useColorModeValue } from '@chakra-ui/react';
import { LineLoader } from '../ui/LineLoader';
import { formatClockTime, formatPrice } from '../../utils/format';
import type { HistoryPoint } from '../../types/oil';

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency?: string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
  currency,
}: ChartTooltipProps) => {
  const bg = useColorModeValue('white', 'petro.700');
  const border = useColorModeValue('paper.200', 'petro.600');
  if (!active || !payload?.length) return null;
  return (
    <Box
      bg={bg}
      border='1px solid'
      borderColor={border}
      borderRadius='md'
      px={3}
      py={2}
      boxShadow='lg'
    >
      <Text fontSize='xs' color='textMuted' mb={0.5}>
        {formatClockTime(label)}
      </Text>
      <Text fontFamily='mono' fontWeight='600' fontSize='sm'>
        {formatPrice(payload[0].value, { currency })}
      </Text>
    </Box>
  );
};

interface PriceTrendChartProps {
  data?: HistoryPoint[] | null;
  colorToken?: string;
  currency?: string;
  height?: number;
  loading?: boolean;
}

export const PriceTrendChart = ({
  data,
  colorToken = 'commodity.wti',
  currency = 'USD',
  height = 280,
  loading = false,
}: PriceTrendChartProps) => {
  const [color] = useToken('colors', [colorToken]);
  const gridColor = useColorModeValue('#E2DFD6', '#1A222B');
  const axisColor = useColorModeValue('#8A97A3', '#5A6A78');
  const gradientId = `trend-${colorToken.replace(/[^a-zA-Z0-9]/g, '-')}`;

  if (!data || data.length === 0) {
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
  }

  return (
    <Box position='relative'>
      <LineLoader active={loading} />
      <ResponsiveContainer width='100%' height={height}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        >
          <defs>
            <linearGradient id={gradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop offset='0%' stopColor={color} stopOpacity={0.32} />
              <stop offset='100%' stopColor={color} stopOpacity={0.02} />
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
          <Tooltip content={<ChartTooltip currency={currency} />} />
          <Area
            type='monotone'
            dataKey='price'
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
            isAnimationActive={true}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
};
