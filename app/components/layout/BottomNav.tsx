import { NavLink } from 'react-router';
import { Box, Flex, Text } from '@chakra-ui/react';
import { NAV_ITEMS } from './navConfig';

export function BottomNav() {
  return (
    <Flex
      as='nav'
      aria-label='Primary'
      justify='space-around'
      position='fixed'
      bottom={0}
      left={0}
      right={0}
      bg='var(--surface)'
      borderTop='1px solid var(--border)'
      padding='6px 0 max(6px, env(safe-area-inset-bottom))'
      zIndex={20}
      display={{ base: 'flex', md: 'none' }}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <Box
          key={to}
          as={NavLink}
          to={to}
          end={end}
          prefetch='viewport'
          flex={1}
          display='flex'
          flexDirection='column'
          alignItems='center'
          gap='2px'
          textDecoration='none'
          color='var(--text-muted)'
          fontWeight={600}
          padding='4px 0'
          sx={{ '&.active': { color: 'var(--brand)' } }}
        >
          <Text as='span' aria-hidden fontSize='1.1rem'>
            <Icon size={14} />
          </Text>
          <Text as='span'>{label}</Text>
        </Box>
      ))}
    </Flex>
  );
}
