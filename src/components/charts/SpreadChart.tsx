import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import { LineLoader } from '../ui/LineLoader';
import { formatClockTime, formatPrice } from '../../utils/format';
import type { SpreadPoint } from '../../utils/spread';

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  pairLabel: string;
}

const ChartTooltip = ({
  active,
  payload,
  label,
  pairLabel,
}: ChartTooltipProps) => {
  const bg = useColorModeValue('white', 'petro.700');
  const border = useColorModeValue('paper.200', 'petro.600');
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
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
        {pairLabel}: {formatPrice(value)}
      </Text>
    </Box>
  );
};

interface SpreadChartProps {
  spread: SpreadPoint[];
  height?: number;
  loading?: boolean;
  labelA?: string;
  labelB?: string;
}

export const SpreadChart = ({
  spread,
  height = 240,
  loading = false,
  labelA = 'A',
  labelB = 'B',
}: SpreadChartProps) => {
  const gridColor = useColorModeValue('#E2DFD6', '#1A222B');
  const axisColor = useColorModeValue('#8A97A3', '#5A6A78');
  const up = useColorModeValue('#2F9E73', '#3FB68B');
  const down = useColorModeValue('#C23B3B', '#D64545');
  const pairLabel = `${labelA} − ${labelB}`;

  if (spread.length === 0) {
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
          {loading
            ? 'Loading…'
            : 'Not enough overlapping data yet — try a wider range.'}
        </Text>
      </Box>
    );
  }

  return (
    <Box position='relative'>
      <LineLoader active={loading} />
      <ResponsiveContainer width='100%' height={height}>
        <BarChart
          data={spread}
          margin={{ top: 8, right: 8, bottom: 0, left: -12 }}
        >
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
            tick={{
              fontSize: 11,
              fill: axisColor,
              fontFamily: 'IBM Plex Mono, monospace',
            }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v: number) => `$${v.toFixed(0)}`}
          />
          <Tooltip
            content={<ChartTooltip pairLabel={pairLabel} />}
            cursor={{ fill: 'rgba(128,128,128,0.08)' }}
          />
          <Bar dataKey='spread' radius={[3, 3, 0, 0]} isAnimationActive={false}>
            {spread.map((d, i) => (
              <Cell key={i} fill={d.spread >= 0 ? up : down} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};
