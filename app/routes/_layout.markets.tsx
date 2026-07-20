import { useMemo, useState } from 'react';
import { Box, Flex, Heading, Input, SimpleGrid, Text } from '@chakra-ui/react';
import { CategoryTabs } from '../components/commodities/CategoryTabs';
import { CommodityCard } from '../components/commodities/CommodityCard';
import { useWatchlist } from '../context/watchlist';
import { useCatalog } from '../context/catalog';

export default function Markets() {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { codes, isTracked, toggle, atLimit, maxSize } = useWatchlist();
  const { commodities, error, isLoading } = useCatalog();
  const categories = useMemo(
    () => Array.from(new Set(commodities.map((c) => c.category))).sort(),
    [commodities],
  );
  const filtered = useMemo(() => {
    let list = commodities;
    if (category) list = list.filter((c) => c.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [category, search, commodities]);

  return (
    <Flex direction="column" gap="1.75rem">
      <Box>
        <Heading>Markets</Heading>
        <Text color="var(--text-muted)" fontSize="0.85rem" marginTop="4px">
          A search catalog from OilPriceAPI. Track any instrument to add it
          to your dashboard or history.
        </Text>
        {isLoading && (
          <Text color="var(--text-muted)" fontSize="0.8rem">
            Loading live catalog...
          </Text>
        )}
        {error && (
          <Text color="var(--text-muted)" fontSize="0.8rem">
            Live catalog unavailable: {error}
          </Text>
        )}
      </Box>
      <Box>
        <Flex
          justify="space-between"
          align="end"
          wrap="wrap"
          gap="10px"
          marginBottom="12px"
        >
          <Text color="var(--text-muted)" fontSize="0.8rem" margin={0}>
            {commodities.length} commodities available · tracking {codes.length}
            /{maxSize}
          </Text>
          <Input
            placeholder="Search commodities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            width="220px"
          />
        </Flex>
        <Box marginBottom="16px">
          <CategoryTabs
            categories={categories}
            active={category}
            onChange={setCategory}
          />
        </Box>
        {filtered.length === 0 && (
          <Text color="var(--text-muted)" fontSize="0.85rem">
            No commodities match that search.
          </Text>
        )}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing="1rem">
          {filtered.map((commodity) => {
            const tracked = isTracked(commodity.code);
            const disabled = tracked ? codes.length <= 1 : atLimit;
            return (
              <CommodityCard
                key={commodity.code}
                commodity={commodity}
                tracked={tracked}
                disabled={disabled}
                disabledReason={
                  tracked
                    ? 'Keep at least one commodity tracked'
                    : `You're tracking ${maxSize}/${maxSize} — untrack one to add another`
                }
                onToggle={() => toggle(commodity.code)}
              />
            );
          })}
        </SimpleGrid>
      </Box>
    </Flex>
  );
}
