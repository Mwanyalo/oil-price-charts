import { VStack, HStack, Box, Text, useColorModeValue } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navConfig';

export const Sidebar = () => {
  const activeBg = useColorModeValue('paper.100', 'petro.700');
  const activeColor = useColorModeValue('brand.600', 'brand.400');
  const idleColor = useColorModeValue('petro.500', 'petro.300');
  const border = useColorModeValue('paper.200', 'petro.700');

  return (
    <VStack
      as='nav'
      aria-label='Primary'
      w='220px'
      h='100vh'
      position='sticky'
      top={0}
      borderRight='1px solid'
      borderColor={border}
      align='stretch'
      spacing={1}
      py={5}
      px={3}
      display={{ base: 'none', md: 'flex' }}
      flexShrink={0}
    >
      <HStack px={2} pb={5} spacing={2}>
        <Box
          w='10px'
          h='10px'
          borderRadius='2px'
          bg='brand.500'
          transform='rotate(45deg)'
        />
        <Text
          fontFamily='heading'
          fontWeight='700'
          fontSize='md'
          letterSpacing='-0.01em'
        >
          Oil Prices
        </Text>
      </HStack>

      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
          {({ isActive }) => (
            <HStack
              spacing='10px'
              px={3}
              py={2.5}
              borderRadius='8px'
              fontSize='14px'
              fontWeight={600}
              bg={isActive ? activeBg : 'transparent'}
              color={isActive ? activeColor : idleColor}
            >
              <Icon size={17} />
              <Text as='span'>{label}</Text>
            </HStack>
          )}
        </NavLink>
      ))}
    </VStack>
  );
};
