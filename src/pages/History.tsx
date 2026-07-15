import { useMemo, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
} from '@chakra-ui/react';
import { PriceTrendChart } from '../components/charts/PriceTrendChart';
import { StyledSelect } from '../components/ui/StyledSelect';
import { usePriceHistory, useCommodities } from '../hooks/useOilData';
import { useWatchlist } from '../context/WatchlistContext';
import { useCommodityColors } from '../hooks/useCommodityColors';
import { formatPrice, formatPercent, seriesChange } from '../utils/format';
import type { PriceRange } from '../types/oil';

const RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'past_day', label: '24 hours' },
  { value: 'past_week', label: '7 days' },
  { value: 'past_month', label: '30 days' },
];

export const History = () => {
  const { codes } = useWatchlist();
  const [code, setCode] = useState(codes[0]);
  const [range, setRange] = useState<PriceRange>('past_month');
  const surface = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');

  const { data: catalog } = useCommodities();
  const catalogByCode = useMemo(
    () => Object.fromEntries((catalog || []).map((c) => [c.code, c])),
    [catalog],
  );
  const activeCode = codes.includes(code) ? code : codes[0];
  const meta = catalogByCode[activeCode];
  const colorMap = useCommodityColors();
  const accent = colorMap[activeCode] || '#8A97A3';

  const { data, loading } = usePriceHistory(activeCode, range, { live: false });

  const commodityOptions = useMemo(
    () => codes.map((c) => ({ value: c, label: catalogByCode[c]?.name || c })),
    [codes, catalogByCode],
  );

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    const prices = data.map((d) => d.price);
    const change = seriesChange(data);
    return {
      high: Math.max(...prices),
      low: Math.min(...prices),
      avg: prices.reduce((a, b) => a + b, 0) / prices.length,
      change,
    };
  }, [data]);

  return (
    <VStack align='stretch' spacing={6}>
      <HStack justify='space-between' wrap='wrap' gap={3}>
        <Box>
          <Heading fontSize={{ base: 'xl', md: '2xl' }}>History</Heading>
          <Text color='textMuted' fontSize='sm' mt={1}>
            A single fetch per range change no live polling needed for a
            backward looking view.
          </Text>
        </Box>
        <HStack spacing={2}>
          <StyledSelect
            size='sm'
            value={activeCode}
            onChange={setCode}
            options={commodityOptions}
            minW='140px'
            aria-label='Commodity'
          />
          <StyledSelect
            size='sm'
            value={range}
            onChange={(v) => setRange(v as PriceRange)}
            options={RANGE_OPTIONS}
            aria-label='Range'
          />
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
        <StatBlock label='High' value={stats ? formatPrice(stats.high) : '—'} />
        <StatBlock label='Low' value={stats ? formatPrice(stats.low) : '—'} />
        <StatBlock
          label='Average'
          value={stats ? formatPrice(stats.avg) : '—'}
        />
        <StatBlock
          label='Change'
          value={stats ? formatPercent(stats.change.pct) : '—'}
          tone={stats ? (stats.change.pct >= 0 ? 'up' : 'down') : undefined}
        />
      </SimpleGrid>

      <Box
        bg={surface}
        border='1px solid'
        borderColor={border}
        borderRadius='lg'
        p={{ base: 4, md: 5 }}
      >
        <HStack spacing={2} mb={4}>
          <Box w='8px' h='8px' borderRadius='full' bg={accent} />
          <Heading fontSize='md'>
            {meta?.name || activeCode} —{' '}
            {RANGE_OPTIONS.find((r) => r.value === range)?.label}
          </Heading>
        </HStack>
        <PriceTrendChart
          data={data}
          colorToken={accent}
          height={360}
          loading={loading}
        />
      </Box>
    </VStack>
  );
};

const StatBlock = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down';
}) => {
  const surface = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');
  const color =
    tone === 'up'
      ? 'commodity.up'
      : tone === 'down'
        ? 'commodity.down'
        : 'textPrimary';
  return (
    <Box
      bg={surface}
      border='1px solid'
      borderColor={border}
      borderRadius='lg'
      p={4}
    >
      <Text fontSize='xs' color='textMuted' mb={1}>
        {label}
      </Text>
      <Text fontFamily='mono' fontWeight='700' fontSize='lg' color={color}>
        {value}
      </Text>
    </Box>
  );
};
