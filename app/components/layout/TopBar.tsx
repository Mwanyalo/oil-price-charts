import { Box, Flex } from '@chakra-ui/react';
import { LiveBadge } from '../ui/LiveBadge';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopBarProps {
  lastUpdated: string | null;
}

export function TopBar({ lastUpdated }: TopBarProps) {
  return (
    <Flex
      as="header"
      position="sticky"
      top={0}
      zIndex={10}
      bg="var(--canvas)"
      borderBottom="1px solid var(--border)"
      padding={{ base: '0.75rem 1.5rem', md: '0.75rem 2rem' }}
      justify="space-between"
      align="center"
    >
      <Flex align="center" gap="8px" display={{ base: 'flex', md: 'none' }}>
        <Box
          width="10px"
          height="10px"
          borderRadius="2px"
          bg="var(--brand)"
          transform="rotate(45deg)"
        />
        <Box
          fontFamily="var(--font-heading)"
          fontWeight={700}
          fontSize="1rem"
        >
          Oil Prices
        </Box>
      </Flex>
      <Box display={{ base: 'none', md: 'flex' }}>
        <LiveBadge live lastUpdated={lastUpdated} />
      </Box>
      <Flex align="center" gap="10px">
        <Box display={{ base: 'flex', md: 'none' }}>
          <LiveBadge live lastUpdated={lastUpdated} />
        </Box>
        <ThemeToggle />
      </Flex>
    </Flex>
  );
}
