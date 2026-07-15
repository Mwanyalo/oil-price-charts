import { HStack, Box } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { TopBar } from './TopBar';
import { TickerTape } from './TickerTape';

export const AppShell = () => {
  return (
    <HStack align='start' spacing={0} minH='100vh' bg='canvas'>
      <Sidebar />
      <Box flex={1} minW={0}>
        <TopBar />
        <TickerTape />
        <Box
          as='main'
          px={{ base: 4, md: 6 }}
          py={{ base: 4, md: 6 }}
          pb={{ base: '84px', md: 6 }}
        >
          <Outlet />
        </Box>
      </Box>
      <BottomNav />
    </HStack>
  );
};
