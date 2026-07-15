import { HStack, Box, Text, useColorModeValue } from '@chakra-ui/react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LiveBadge } from '../ui/LiveBadge';
import { useLatestPrices } from '../../hooks/useOilData';
import { useWatchlist } from '../../context/WatchlistContext';

export const TopBar = () => {
  const border = useColorModeValue('paper.200', 'petro.700');
  const bg = useColorModeValue('white', 'petro.800');
  const { codes } = useWatchlist();
  const { lastUpdated } = useLatestPrices(codes);

  return (
    <HStack
      as='header'
      position='sticky'
      top={0}
      zIndex={10}
      bg={bg}
      borderBottom='1px solid'
      borderColor={border}
      px={{ base: 4, md: 6 }}
      py={3}
      justify='space-between'
    >
      <HStack spacing={2} display={{ base: 'flex', md: 'none' }}>
        <Box
          w='9px'
          h='9px'
          borderRadius='2px'
          bg='brand.500'
          transform='rotate(45deg)'
        />
        <Text fontFamily='heading' fontWeight='700' fontSize='md'>
          Crude Signal
        </Text>
      </HStack>

      <HStack spacing={3} display={{ base: 'none', md: 'flex' }}>
        <LiveBadge live={true} lastUpdated={lastUpdated} size='md' />
      </HStack>

      <HStack spacing={2}>
        <Box display={{ base: 'block', md: 'none' }}>
          <LiveBadge live={true} lastUpdated={lastUpdated} size='sm' />
        </Box>
        <ThemeToggle />
      </HStack>
    </HStack>
  );
};
