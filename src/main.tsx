import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import App from './App.tsx';
import theme from './theme';
import { DataProvider } from './providers/DataProvider.tsx';
import { WatchlistProvider } from './context/WatchlistContext.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <ErrorBoundary>
        <DataProvider>
          <WatchlistProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </WatchlistProvider>
        </DataProvider>
      </ErrorBoundary>
    </ChakraProvider>
  </React.StrictMode>,
);
