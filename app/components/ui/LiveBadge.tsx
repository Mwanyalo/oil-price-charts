import { useEffect, useState } from 'react';
import { Box, HStack, Text } from '@chakra-ui/react';
import { formatRelativeTime } from '../../data/priceFormat';

interface LiveBadgeProps {
  live: boolean;
  lastUpdated: string | null;
}

export function LiveBadge({ live, lastUpdated }: LiveBadgeProps) {
  // re-render every few seconds so "12s ago" keeps advancing
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <HStack spacing={1.5} display="inline-flex" alignItems="center">
      <Box
        as="span"
        width="6px"
        height="6px"
        borderRadius="50%"
        bg={live ? '#5fa87c' : '#5a5a5f'}
        className={live ? 'pulse-dot' : undefined}
      />
      <Text
        as="span"
        fontFamily="var(--font-mono)"
        fontSize="0.78rem"
        color="#8b8b90"
      >
        {live ? 'LIVE' : 'PAUSED'} · {formatRelativeTime(lastUpdated)}
      </Text>
    </HStack>
  );
}
