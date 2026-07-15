import { Box, HStack, Text, useColorModeValue } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useLatestPrices, useCommodities } from '../../hooks/useOilData';
import { useCommodityColors } from '../../hooks/useCommodityColors';
import { useWatchlist } from '../../context/WatchlistContext';
import { formatPrice } from '../../utils/format';

const scroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

export const TickerTape = () => {
  const { codes } = useWatchlist();
  const { data: prices } = useLatestPrices(codes, {
    live: true,
    intervalMs: 15000,
  });
  const { data: catalog } = useCommodities();
  const colorMap = useCommodityColors();
  const borderColor = useColorModeValue('paper.200', 'petro.700');
  const bg = useColorModeValue('paper.100', 'petro.950');

  const nameByCode = Object.fromEntries(
    (catalog || []).map((c) => [c.code, c.name]),
  );
  const items = (prices || []).map((p) => ({
    ...p,
    name: nameByCode[p.code] || p.code,
  }));
  const looped = [...items, ...items];

  return (
    <Box
      overflow='hidden'
      bg={bg}
      borderBottom='1px solid'
      borderColor={borderColor}
      py={2}
      role='marquee'
      aria-label='Live watchlist price ticker'
      sx={{
        '@media (prefers-reduced-motion: reduce)': {
          '& > div': { animation: 'none', overflowX: 'auto' },
        },
      }}
    >
      <HStack
        spacing={10}
        w='max-content'
        animation={items.length ? `${scroll} 28s linear infinite` : 'none'}
        _hover={{ animationPlayState: 'paused' }}
        px={4}
      >
        {looped.map((item, i) => (
          <HStack key={`${item.code}-${i}`} spacing={2} flexShrink={0}>
            <Box
              w='6px'
              h='6px'
              borderRadius='full'
              bg={colorMap[item.code] || '#8A97A3'}
            />
            <Text
              fontFamily='mono'
              fontSize='xs'
              color='textMuted'
              fontWeight='600'
              noOfLines={1}
              maxW='140px'
            >
              {item.name}
            </Text>
            <Text fontFamily='mono' fontSize='xs' fontWeight='600'>
              {formatPrice(item.price, { currency: item.currency })}
            </Text>
          </HStack>
        ))}
        {looped.length === 0 && (
          <Text fontFamily='mono' fontSize='xs' color='textMuted'>
            Connecting to market feed…
          </Text>
        )}
      </HStack>
    </Box>
  );
};
