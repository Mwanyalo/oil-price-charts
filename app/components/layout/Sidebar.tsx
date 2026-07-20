import { NavLink } from 'react-router';
import { Box, Flex, Text } from '@chakra-ui/react';
import { NAV_ITEMS } from './navConfig';

export function Sidebar() {
  return (
    <Flex
      as="nav"
      aria-label="Primary"
      direction="column"
      gap="2px"
      width="220px"
      flexShrink={0}
      position="sticky"
      top={0}
      height="100vh"
      borderRight="1px solid var(--border)"
      padding="1.25rem 0.75rem"
      display={{ base: 'none', md: 'flex' }}
    >
      <Flex align="center" gap="8px" padding="0 0.5rem 1.25rem">
        <Box
          width="10px"
          height="10px"
          borderRadius="2px"
          bg="var(--brand)"
          transform="rotate(45deg)"
        />
        <Text fontFamily="var(--font-heading)" fontWeight={700} fontSize="1rem">
          Oil Prices
        </Text>
      </Flex>
      {NAV_ITEMS.map(({ to, label, icon, end }) => (
        <Box
          key={to}
          as={NavLink}
          to={to}
          end={end}
          display="flex"
          alignItems="center"
          gap="10px"
          padding="0.6rem 0.75rem"
          borderRadius="8px"
          fontSize="0.875rem"
          fontWeight={600}
          color="var(--text-muted)"
          textDecoration="none"
          sx={{
            '&.active': { bg: 'var(--surface)', color: 'var(--brand)' },
          }}
        >
          <Box as="span" aria-hidden>
            {icon}
          </Box>
          <Box as="span">{label}</Box>
        </Box>
      ))}
    </Flex>
  );
}
