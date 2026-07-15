import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  IconButton,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiSearch, FiArrowDown, FiRepeat } from 'react-icons/fi';
import {
  WatchlistOverlayChart,
  toLineConfig,
} from '../components/charts/WatchlistOverlayChart';
import { SpreadChart } from '../components/charts/SpreadChart';
import { CategoryTabs } from '../components/commodities/CategoryTabs';
import { CommodityCard } from '../components/commodities/CommodityCard';
import { StyledSelect } from '../components/ui/StyledSelect';
import { useCommodities, usePriceHistories } from '../hooks/useOilData';
import { useCommodityColors } from '../hooks/useCommodityColors';
import { useWatchlist } from '../context/WatchlistContext';
import { buildSpread } from '../utils/spread';
import type { PriceRange } from '../types/oil';

const RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'past_day', label: '24H' },
  { value: 'past_week', label: '7D' },
  { value: 'past_month', label: '30D' },
];

export const Markets = () => {
  const [range, setRange] = useState<PriceRange>('past_week');
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const surface = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');
  const catalogRef = useRef<HTMLDivElement>(null);

  const { codes, isTracked, toggle, atLimit, maxSize } = useWatchlist();
  const { data: catalog, loading: catalogLoading } = useCommodities();
  const { data: series, loading: seriesLoading } = usePriceHistories(
    codes,
    range,
  );
  const colorMap = useCommodityColors();

  const catalogByCode = useMemo(
    () => Object.fromEntries((catalog || []).map((c) => [c.code, c])),
    [catalog],
  );
  const lines = useMemo(
    () => toLineConfig(codes, catalogByCode, colorMap),
    [codes, catalogByCode, colorMap],
  );
  const commodityOptions = useMemo(
    () => codes.map((c) => ({ value: c, label: catalogByCode[c]?.name || c })),
    [codes, catalogByCode],
  );

  const categories = useMemo(
    () => Array.from(new Set((catalog || []).map((c) => c.category))).sort(),
    [catalog],
  );

  const filteredCatalog = useMemo(() => {
    let list = catalog || [];
    if (category) list = list.filter((c) => c.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [catalog, category, search]);

  // --- Spread: pick any two tracked commodities to diff, not just Brent/WTI ---
  const buildDefaultPair = (available: string[]): [string, string] | null => {
    if (available.length < 2) return null;
    if (
      available.includes('BRENT_CRUDE_USD') &&
      available.includes('WTI_USD')
    ) {
      return ['BRENT_CRUDE_USD', 'WTI_USD'];
    }
    return [available[0], available[1]];
  };

  const [spreadPair, setSpreadPair] = useState<[string, string] | null>(() =>
    buildDefaultPair(codes),
  );

  // Keep the pair pointed at codes that are still tracked, and always distinct.
  useEffect(() => {
    setSpreadPair((prev) => {
      if (codes.length < 2) return null;
      const validA = prev && codes.includes(prev[0]) ? prev[0] : null;
      const validB =
        prev && codes.includes(prev[1]) && prev[1] !== validA ? prev[1] : null;
      if (validA && validB) return [validA, validB];
      const fallbackA = validA ?? buildDefaultPair(codes)![0];
      const fallbackB =
        validB ?? codes.find((c) => c !== fallbackA) ?? codes[1];
      return [fallbackA, fallbackB];
    });
  }, [codes]);

  const [spreadA, spreadB] = spreadPair ?? [null, null];
  const setSpreadA = (v: string) =>
    setSpreadPair((prev) => [
      v,
      prev?.[1] === v ? (prev?.[0] ?? v) : (prev?.[1] ?? v),
    ]);
  const setSpreadB = (v: string) =>
    setSpreadPair((prev) => [
      prev?.[0] === v ? (prev?.[1] ?? v) : (prev?.[0] ?? v),
      v,
    ]);

  const spreadOptionsA = commodityOptions;
  const spreadOptionsB = commodityOptions.filter((o) => o.value !== spreadA);

  const spreadData = useMemo(() => {
    if (!spreadA || !spreadB) return [];
    return buildSpread(series?.[spreadA] || [], series?.[spreadB] || []);
  }, [series, spreadA, spreadB]);

  const spreadLabelA = spreadA ? catalogByCode[spreadA]?.name || spreadA : '';
  const spreadLabelB = spreadB ? catalogByCode[spreadB]?.name || spreadB : '';

  const scrollToCatalog = () =>
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <VStack align='stretch' spacing={8}>
      <HStack justify='space-between' align='start' wrap='wrap' gap={3}>
        <Box>
          <Heading fontSize={{ base: 'xl', md: '2xl' }}>Markets</Heading>
          <Text color='textMuted' fontSize='sm' mt={1}>
            Compare what you're tracking, then browse the full catalog to add
            more.
          </Text>
        </Box>
        <Button
          size='sm'
          variant='outline'
          rightIcon={<FiArrowDown size={14} />}
          onClick={scrollToCatalog}
        >
          Browse commodity catalog
        </Button>
      </HStack>

      <Box
        bg={surface}
        border='1px solid'
        borderColor={border}
        borderRadius='lg'
        p={{ base: 4, md: 5 }}
      >
        <HStack justify='space-between' mb={1} wrap='wrap' gap={2}>
          <Heading fontSize='md'>Your watchlist, normalized</Heading>
          <StyledSelect
            size='sm'
            value={range}
            onChange={(v) => setRange(v as PriceRange)}
            options={RANGE_OPTIONS}
            aria-label='Chart range'
          />
        </HStack>
        <Text fontSize='sm' color='textMuted' mb={3}>
          % change from the start of the range a quick read on relative
          movement. The chips above the chart show each commodity's current
          move, sorted best to worst.
        </Text>
        <WatchlistOverlayChart
          series={series || {}}
          lines={lines}
          loading={seriesLoading && !series}
        />
      </Box>

      {codes.length >= 2 && spreadA && spreadB && (
        <Box
          bg={surface}
          border='1px solid'
          borderColor={border}
          borderRadius='lg'
          p={{ base: 4, md: 5 }}
        >
          <HStack justify='space-between' mb={1} wrap='wrap' gap={2}>
            <Heading fontSize='md'>Spread</Heading>
          </HStack>
          <Text fontSize='sm' color='textMuted' mb={3}>
            The gap between two tracked commodities useful for reading regional
            or grade premiums.
          </Text>

          <HStack spacing={2} mb={4} wrap='wrap'>
            <StyledSelect
              size='sm'
              value={spreadA}
              onChange={setSpreadA}
              options={spreadOptionsA}
              minW='170px'
              aria-label='First commodity'
            />
            <IconButton
              aria-label='Swap commodities'
              icon={<FiRepeat size={14} />}
              size='sm'
              variant='ghost'
              onClick={() => {
                const a = spreadA;
                setSpreadA(spreadB);
                setSpreadB(a);
              }}
            />
            <Text fontSize='sm' color='textMuted'>
              −
            </Text>
            <StyledSelect
              size='sm'
              value={spreadB}
              onChange={setSpreadB}
              options={spreadOptionsB}
              minW='170px'
              aria-label='Second commodity'
            />
          </HStack>

          <Text fontSize='xs' color='textMuted' mb={2} fontFamily='mono'>
            {spreadLabelA} − {spreadLabelB}
          </Text>
          <SpreadChart
            spread={spreadData}
            loading={seriesLoading && spreadData.length === 0}
            labelA={spreadLabelA}
            labelB={spreadLabelB}
          />
        </Box>
      )}

      <Box ref={catalogRef} scrollMarginTop='80px'>
        <HStack justify='space-between' align='end' mb={1} wrap='wrap' gap={2}>
          <Box>
            <Heading fontSize='md'>Browse the catalog</Heading>
            <Text fontSize='sm' color='textMuted' mt={0.5}>
              {catalog
                ? `${catalog.length} commodities available`
                : 'Loading catalog…'}{' '}
              · tracking {codes.length}/{maxSize}
            </Text>
          </Box>
          <InputGroup w={{ base: 'full', sm: '240px' }}>
            <InputLeftElement pointerEvents='none'>
              <FiSearch color='var(--chakra-colors-petro-400)' />
            </InputLeftElement>
            <Input
              size='sm'
              placeholder='Search commodities…'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              borderRadius='md'
            />
          </InputGroup>
        </HStack>
        <Text fontSize='xs' color='textMuted' mb={4}>
          Filter by category, then tap Track on anything you want to follow
          it'll show up on the Dashboard and in the comparison above.
        </Text>

        <Box mb={4}>
          <CategoryTabs
            categories={categories}
            active={category}
            onChange={setCategory}
          />
        </Box>

        {!catalogLoading && filteredCatalog.length === 0 && (
          <Text fontSize='sm' color='textMuted'>
            No commodities match that search.
          </Text>
        )}

        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={4}>
          {filteredCatalog.map((commodity) => (
            <CommodityCard
              key={commodity.code}
              commodity={commodity}
              tracked={isTracked(commodity.code)}
              atLimit={atLimit}
              canUntrack={codes.length > 1}
              onToggle={() => toggle(commodity.code)}
            />
          ))}
        </SimpleGrid>
      </Box>
    </VStack>
  );
};
