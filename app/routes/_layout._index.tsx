import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import type { Route } from './+types/_layout._index';
import { StatCard } from '../components/ui/StatCard';
import { TrendChart } from '../components/charts/TrendChart';
import { LiveBadge } from '../components/ui/LiveBadge';
import { useWatchlist } from '../context/watchlist';
import { useLiveData } from '../context/dataProvider';
import { buildColorMap, type Commodity } from '../data/catalog';
import { useCatalog } from '../context/catalog';
import {
  seriesChange,
  type HistoryPoint,
  type PriceRange,
} from '../data/priceFormat';

interface SeriesResponse {
  code: string;
  range: string;
  data: HistoryPoint[];
  error?: string;
}

const CHART_RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'past_day', label: '24h' },
  { value: 'past_week', label: '7d' },
  { value: 'past_month', label: '30d' },
];

export async function loader({}: Route.LoaderArgs) {
  return { series: {} as Record<string, HistoryPoint[]> };
}

function LiveStatCard({
  code,
  accent,
  isFocused,
  onFocus,
  onRemove,
  initialSeries,
  meta,
}: {
  code: string;
  accent: string;
  isFocused: boolean;
  onFocus: () => void;
  onRemove?: () => void;
  initialSeries?: HistoryPoint[];
  meta?: Commodity;
}) {
  const { data, error } = useLiveData<SeriesResponse>(
    'series',
    { code, range: 'past_day' },
    {
      live: { enabled: true, intervalMs: 2 * 60 * 1000 },
      initialData: initialSeries
        ? { code, range: 'past_day', data: initialSeries }
        : undefined,
    },
  );

  const series = data?.data;
  const change = seriesChange(series);
  const last = series?.[series.length - 1];
  const errorMessage =
    data?.error || (error instanceof Error ? error.message : undefined);

  return (
    <StatCard
      label={meta?.name || code}
      accent={accent}
      price={last?.price}
      currency={meta?.currency}
      unit={meta?.unit}
      changePct={series?.length ? change.pct : null}
      sparkline={series}
      isActive={isFocused}
      onClick={onFocus}
      onRemove={onRemove}
      note={errorMessage}
    />
  );
}

function FocusedChart({
  code,
  accent,
  initialSeries,
  meta,
}: {
  code: string;
  accent: string;
  initialSeries?: HistoryPoint[];
  meta?: Commodity;
}) {
  const [range, setRange] = useState<PriceRange>('past_day');
  const isIntraday = range === 'past_day';
  const {
    data,
    error,
    isLoading: loading,
    lastUpdated,
  } = useLiveData<SeriesResponse>(
    'series',
    { code, range },
    {
      live: { enabled: isIntraday, intervalMs: 60 * 1000 },
      initialData:
        isIntraday && initialSeries
          ? { code, range: 'past_day', data: initialSeries }
          : undefined,
    },
  );

  const errorMessage =
    data?.error || (error instanceof Error ? error.message : undefined);

  return (
    <Card>
      <CardBody>
        <Flex
          justify='space-between'
          align='center'
          wrap='wrap'
          gap='12px'
          marginBottom='12px'
        >
          <Flex align='center' gap='8px'>
            <Box width='8px' height='8px' borderRadius='50%' bg={accent} />
            <Heading fontSize='1rem'>{meta?.name || code} trend</Heading>
          </Flex>

          <Flex align='center' gap='12px' wrap='wrap'>
            {isIntraday && (
              <LiveBadge
                live
                lastUpdated={
                  lastUpdated ? new Date(lastUpdated).toISOString() : null
                }
              />
            )}
            <HStack spacing={1}>
              {CHART_RANGE_OPTIONS.map((option) => {
                const isActive = option.value === range;
                return (
                  <Button
                    key={option.value}
                    onClick={() => setRange(option.value)}
                    size='xs'
                    height='auto'
                    padding='0.3rem 0.6rem'
                    borderRadius='999px'
                    border='1px solid'
                    borderColor={
                      isActive ? 'var(--text-primary)' : 'var(--border)'
                    }
                    bg={isActive ? 'var(--text-primary)' : 'transparent'}
                    color={isActive ? 'var(--canvas)' : 'var(--text-muted)'}
                    fontSize='0.72rem'
                    fontWeight={600}
                    _hover={{
                      bg: isActive ? 'var(--text-primary)' : 'var(--border)',
                    }}
                  >
                    {option.label}
                  </Button>
                );
              })}
            </HStack>
          </Flex>
        </Flex>

        {errorMessage ? (
          <Text color='var(--text-muted)' fontSize='0.8rem'>
            {errorMessage}
          </Text>
        ) : (
          <TrendChart
            data={data?.data}
            color={accent}
            currency={meta?.currency}
            loading={loading}
          />
        )}
      </CardBody>
    </Card>
  );
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { codes, untrack } = useWatchlist();
  const { byCode } = useCatalog();
  const colorMap = buildColorMap(codes);
  const [focused, setFocused] = useState(codes[0]);

  useEffect(() => {
    if (!codes.includes(focused)) setFocused(codes[0]);
  }, [codes, focused]);

  if (!codes.length) {
    return (
      <Box>
        <Heading fontSize='1.5rem'>Dashboard</Heading>
        <Text color='var(--text-muted)'>
          Waiting for the live OilPriceAPI catalog.
        </Text>
      </Box>
    );
  }

  return (
    <Flex direction='column' gap='1rem'>
      <Box>
        <Heading fontSize='1.5rem'>Dashboard</Heading>
        <Text color='var(--text-muted)' fontSize='0.85rem' marginTop='4px'>
          Tap a card to change the chart below and manage what's tracked from
          Markets.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing='1rem'>
        {codes.map((code) => (
          <LiveStatCard
            key={code}
            code={code}
            accent={colorMap[code] || '#8A97A3'}
            isFocused={focused === code}
            onFocus={() => setFocused(code)}
            onRemove={codes.length > 1 ? () => untrack(code) : undefined}
            initialSeries={loaderData.series[code]}
            meta={byCode[code]}
          />
        ))}
      </SimpleGrid>

      <FocusedChart
        code={focused}
        accent={colorMap[focused] || '#8A97A3'}
        initialSeries={loaderData.series[focused]}
        meta={byCode[focused]}
      />
    </Flex>
  );
}
