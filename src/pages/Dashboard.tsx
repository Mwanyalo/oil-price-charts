import { useMemo, useState, useEffect } from 'react';
import {
  Box,
  SimpleGrid,
  HStack,
  VStack,
  Heading,
  Text,
  Switch,
  useColorModeValue,
} from '@chakra-ui/react';
import { StatCard } from '../components/ui/StatCard';
import { PriceTrendChart } from '../components/charts/PriceTrendChart';
import { LiveBadge } from '../components/ui/LiveBadge';
import { StyledSelect } from '../components/ui/StyledSelect';
import {
  useLatestPrices,
  usePriceHistory,
  usePriceHistories,
  useCommodities,
} from '../hooks/useOilData';
import { useCommodityColors } from '../hooks/useCommodityColors';
import { useWatchlist } from '../context/WatchlistContext';
import { seriesChange } from '../utils/format';
import type { PriceRange, LatestPrice } from '../types/oil';

const RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'past_day', label: '24H' },
  { value: 'past_week', label: '7D' },
  { value: 'past_month', label: '30D' },
];

const INTERVAL_OPTIONS: { value: string; label: string }[] = [
  { value: '10000', label: 'Every 10s' },
  { value: '20000', label: 'Every 20s' },
  { value: '60000', label: 'Every 60s' },
];

export const Dashboard = () => {
  const { codes, untrack } = useWatchlist();
  const [focused, setFocused] = useState<string>(codes[0]);
  const [range, setRange] = useState<PriceRange>('past_day');
  const [liveChart, setLiveChart] = useState(true);
  const [intervalMs, setIntervalMs] = useState(20000);

  useEffect(() => {
    if (!codes.includes(focused)) setFocused(codes[0]);
  }, [codes, focused]);

  const { data: latest } = useLatestPrices(codes, {
    live: true,
    intervalMs: 20000,
  });
  const { data: catalog } = useCommodities();
  const surface = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');

  const catalogByCode = useMemo(
    () => Object.fromEntries((catalog || []).map((c) => [c.code, c])),
    [catalog],
  );

  const {
    data: focusedHistory,
    loading: focusedLoading,
    lastUpdated: chartUpdated,
  } = usePriceHistory(focused, range, {
    live: liveChart,
    intervalMs,
  });

  const { data: sparklines } = usePriceHistories(codes, 'past_day');

  const colorMap = useCommodityColors();

  const priceByCode = useMemo(() => {
    const map: Record<string, LatestPrice> = {};
    (latest || []).forEach((p) => {
      map[p.code] = p;
    });
    return map;
  }, [latest]);

  const focusedMeta = catalogByCode[focused];
  const focusedLabel = focusedMeta?.name || focused;
  const focusedAccent = colorMap[focused] || '#8A97A3';

  return (
    <VStack align='stretch' spacing={6}>
      <Box>
        <Heading fontSize={{ base: 'xl', md: '2xl' }}>Dashboard</Heading>
        <Text color='textMuted' fontSize='sm' mt={1}>
          Your watchlist refreshes every 20s. Tap a card to change the chart
          below and manage what's tracked from Markets.
        </Text>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
        {codes.map((code) => {
          const spark = sparklines?.[code];
          const change = seriesChange(spark);
          const live = priceByCode[code];
          const meta = catalogByCode[code];
          return (
            <StatCard
              key={code}
              label={meta?.name || code}
              accent={colorMap[code] || '#8A97A3'}
              price={live?.price}
              currency={live?.currency}
              unit={live?.unit || meta?.unit}
              changePct={spark ? change.pct : null}
              sparkline={spark}
              isActive={focused === code}
              onClick={() => setFocused(code)}
              onRemove={codes.length > 1 ? () => untrack(code) : undefined}
            />
          );
        })}
      </SimpleGrid>

      <Box
        bg={surface}
        border='1px solid'
        borderColor={border}
        borderRadius='lg'
        p={{ base: 4, md: 5 }}
      >
        <VStack align='stretch' spacing={4}>
          <HStack justify='space-between' wrap='wrap' gap={3}>
            <HStack spacing={2}>
              <Box w='8px' h='8px' borderRadius='full' bg={focusedAccent} />
              <Heading fontSize='md' fontFamily='heading'>
                {focusedLabel} trend
              </Heading>
            </HStack>
            <LiveBadge live={liveChart} lastUpdated={chartUpdated} />
          </HStack>

          <HStack justify='space-between' wrap='wrap' gap={3}>
            <HStack spacing={3}>
              <StyledSelect
                size='sm'
                value={range}
                onChange={(v) => setRange(v as PriceRange)}
                options={RANGE_OPTIONS}
                aria-label='Chart range'
              />
              <StyledSelect
                size='sm'
                value={String(intervalMs)}
                onChange={(v) => setIntervalMs(Number(v))}
                options={INTERVAL_OPTIONS}
                isDisabled={!liveChart}
                minW='130px'
                aria-label='Refresh frequency'
              />
            </HStack>

            <HStack spacing={2}>
              <Text fontSize='sm' color='textMuted'>
                Live updates
              </Text>
              <Switch
                colorScheme='orange'
                isChecked={liveChart}
                onChange={(e) => setLiveChart(e.target.checked)}
              />
            </HStack>
          </HStack>

          <PriceTrendChart
            data={focusedHistory}
            colorToken={focusedAccent}
            currency={priceByCode[focused]?.currency}
            loading={focusedLoading}
          />
        </VStack>
      </Box>
    </VStack>
  );
};
