import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import {
  Box,
  HStack,
  Wrap,
  WrapItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { LineLoader } from '../ui/LineLoader';
import { formatClockTime, formatPercent } from '../../utils/format';
import type { Commodity, HistoryPoint } from '../../types/oil';

export interface OverlayLine {
  code: string;
  label: string;
  color: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number; dataKey: string; color: string; name: string }[];
  label?: string;
}

const ChartTooltip = ({ active, payload, label }: ChartTooltipProps) => {
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
      maxW='220px'
    >
      <Text fontSize='xs' color='textMuted' mb={1}>
        {formatClockTime(label)}
      </Text>
      {payload.map((p) => (
        <Text
          key={p.dataKey}
          fontFamily='mono'
          fontSize='xs'
          color={p.color}
          noOfLines={1}
        >
          {p.name}: {formatPercent(p.value)}
        </Text>
      ))}
    </Box>
  );
};

interface WatchlistOverlayChartProps {
  series: Record<string, HistoryPoint[] | null | undefined>;
  lines: OverlayLine[];
  height?: number;
  loading?: boolean;
}

export const WatchlistOverlayChart = ({
  series,
  lines,
  height = 320,
  loading = false,
}: WatchlistOverlayChartProps) => {
  const gridColor = useColorModeValue('#E2DFD6', '#1A222B');
  const axisColor = useColorModeValue('#8A97A3', '#5A6A78');
  const chipBg = useColorModeValue('paper.100', 'petro.700');
  const upColor = useColorModeValue('#2F9E73', '#3FB68B');
  const downColor = useColorModeValue('#C23B3B', '#D64545');

  const merged: Record<string, Record<string, unknown> & { time: string }> = {};
  lines.forEach((line) => {
    const raw = series[line.code] || [];
    const base = raw[0]?.price;
    raw.forEach((point) => {
      if (!merged[point.time]) merged[point.time] = { time: point.time };
      merged[point.time][line.code] = base
        ? ((point.price - base) / base) * 100
        : 0;
    });
  });
  const data = Object.values(merged).sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  const currentPct: Record<string, number | undefined> = {};
  lines.forEach((line) => {
    for (let i = data.length - 1; i >= 0; i--) {
      const v = data[i][line.code];
      if (typeof v === 'number') {
        currentPct[line.code] = v;
        break;
      }
    }
  });
  const sortedLines = [...lines].sort(
    (a, b) =>
      (currentPct[b.code] ?? -Infinity) - (currentPct[a.code] ?? -Infinity),
  );

  if (lines.length === 0) {
    return (
      <Box
        height={height}
        display='flex'
        alignItems='center'
        justifyContent='center'
      >
        <Text color='textMuted' fontSize='sm'>
          Track a commodity below to chart it here.
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Wrap spacing={2} mb={4}>
        {sortedLines.map((line) => {
          const pct = currentPct[line.code];
          const up = (pct ?? 0) >= 0;
          return (
            <WrapItem key={line.code}>
              <HStack
                spacing={1.5}
                bg={chipBg}
                borderRadius='full'
                pl={2}
                pr={2.5}
                py={1}
              >
                <Box
                  w='8px'
                  h='8px'
                  borderRadius='full'
                  bg={line.color}
                  flexShrink={0}
                />
                <Text fontSize='xs' fontWeight='600' noOfLines={1} maxW='140px'>
                  {line.label}
                </Text>
                <Text
                  fontFamily='mono'
                  fontSize='xs'
                  fontWeight='700'
                  color={pct == null ? 'textMuted' : up ? upColor : downColor}
                >
                  {pct == null ? '—' : formatPercent(pct)}
                </Text>
              </HStack>
            </WrapItem>
          );
        })}
      </Wrap>

      <Box position='relative'>
        <LineLoader active={loading} />
        <ResponsiveContainer width='100%' height={height}>
          <LineChart
            data={data}
            margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
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
              minTickGap={48}
            />
            <YAxis
              tick={{
                fontSize: 11,
                fill: axisColor,
                fontFamily: 'IBM Plex Mono, monospace',
              }}
              tickLine={false}
              axisLine={false}
              width={46}
              tickFormatter={(v: number) =>
                `${v > 0 ? '+' : ''}${v.toFixed(0)}%`
              }
            />
            <ReferenceLine y={0} stroke={gridColor} />
            <Tooltip content={<ChartTooltip />} />
            {lines.map((line) => (
              <Line
                key={line.code}
                type='monotone'
                dataKey={line.code}
                name={line.label}
                stroke={line.color}
                strokeWidth={2.25}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
};

export const toLineConfig = (
  codes: string[],
  catalogByCode: Record<string, Commodity>,
  colorMap: Record<string, string>,
): OverlayLine[] =>
  codes.map((code) => ({
    code,
    label: catalogByCode[code]?.name || code,
    color: colorMap[code] || '#8A97A3',
  }));
