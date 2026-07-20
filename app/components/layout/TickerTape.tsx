import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useLiveData } from '../../context/dataProvider';
import { useCatalog } from '../../context/catalog';
import { formatPrice, type HistoryPoint } from '../../data/priceFormat';

interface LatestResponse {
  updatedAt: string;
  prices: Record<string, HistoryPoint>;
}

interface TickerTapeProps {
  codes: string[];
  colors: Record<string, string>;
  initialPrices?: Record<string, HistoryPoint>;
}

const tickerScroll = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`;

export function TickerTape({ codes, colors, initialPrices }: TickerTapeProps) {
  const { byCode } = useCatalog();
  const { data } = useLiveData<LatestResponse>(
    'latest',
    { codes },
    {
      live: { enabled: true, intervalMs: 5 * 60 * 1000 },
      initialData: initialPrices
        ? { updatedAt: new Date().toISOString(), prices: initialPrices }
        : undefined,
    },
  );

  if (codes.length === 0) return null;
  const latest = data?.prices ?? {};
  const items = [...codes, ...codes];

  return (
    <Box overflow="hidden" borderBottom="1px solid var(--border)" bg="var(--surface)">
      <Box
        display="flex"
        gap="2rem"
        padding="0.5rem 1.5rem"
        whiteSpace="nowrap"
        width="max-content"
        animation={`${tickerScroll} 30s linear infinite`}
      >
        {items.map((code, i) => {
          const meta = byCode[code];
          const point = latest[code];
          return (
            <Box
              key={`${code}-${i}`}
              as="span"
              display="inline-flex"
              alignItems="center"
              gap="8px"
              fontSize="0.8rem"
              color="var(--text-muted)"
            >
              <Box
                as="span"
                width="6px"
                height="6px"
                borderRadius="50%"
                bg={colors[code]}
                display="inline-block"
              />
              {meta?.name || code}
              <Box as="strong" fontFamily="var(--font-mono)">
                {point ? formatPrice(point.price, meta?.currency) : ''}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
