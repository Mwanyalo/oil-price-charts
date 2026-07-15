import { HStack, VStack, Text, useColorModeValue } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navConfig';

export const BottomNav = () => {
  const bg = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');
  const activeColor = useColorModeValue('brand.600', 'brand.400');
  const idleColor = useColorModeValue('petro.400', 'petro.400');

  return (
    <HStack
      as='nav'
      aria-label='Primary'
      display={{ base: 'flex', md: 'none' }}
      position='fixed'
      bottom={0}
      left={0}
      right={0}
      bg={bg}
      borderTop='1px solid'
      borderColor={border}
      justify='space-around'
      py={1.5}
      zIndex={20}
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          style={{ textDecoration: 'none', flex: 1 }}
        >
          {({ isActive }) => (
            <VStack
              spacing={0.5}
              py={1}
              color={isActive ? activeColor : idleColor}
            >
              <Icon size={19} />
              <Text fontSize='10px' fontWeight='600'>
                {label}
              </Text>
            </VStack>
          )}
        </NavLink>
      ))}
    </HStack>
  );
};
