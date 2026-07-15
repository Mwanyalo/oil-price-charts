import { HStack, Text, Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { useEffect, useState } from 'react';
import { formatRelativeTime } from '../../utils/format';

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(63, 182, 139, 0.55); }
  70% { box-shadow: 0 0 0 6px rgba(63, 182, 139, 0); }
  100% { box-shadow: 0 0 0 0 rgba(63, 182, 139, 0); }
`;

interface LiveBadgeProps {
  live: boolean;
  lastUpdated: number | null;
  size?: 'sm' | 'md';
}

export const LiveBadge = ({
  live,
  lastUpdated,
  size = 'sm',
}: LiveBadgeProps) => {
  // Re-render every few seconds so the relative-time label stays fresh.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const fontSize = size === 'sm' ? 'xs' : 'sm';

  return (
    <HStack spacing={1.5} align='center'>
      <Box
        w={size === 'sm' ? '6px' : '7px'}
        h={size === 'sm' ? '6px' : '7px'}
        borderRadius='full'
        bg={live ? 'commodity.up' : 'petro.400'}
        animation={live ? `${pulse} 2s infinite` : 'none'}
      />
      <Text
        fontFamily='mono'
        fontSize={fontSize}
        color='textMuted'
        whiteSpace='nowrap'
      >
        {live ? 'LIVE' : 'PAUSED'} · {formatRelativeTime(lastUpdated)}
      </Text>
    </HStack>
  );
};
