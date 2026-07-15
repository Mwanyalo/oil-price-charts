import { extendTheme, type ThemeConfig } from '@chakra-ui/react';
import type { StyleFunctionProps } from '@chakra-ui/theme-tools';

const commodity = {
  wti: '#E8672E',
  brent: '#2FBEB0',
  gas: '#E0B23C',
  up: '#3FB68B',
  down: '#D64545',
};

const colors = {
  brand: {
    50: '#FFF1E8',
    100: '#FFD9BE',
    200: '#FFBD8E',
    300: '#FFA05D',
    400: '#F5843D',
    500: '#E8672E',
    600: '#C24F1F',
    700: '#983D18',
    800: '#6E2C12',
    900: '#451B0A',
  },
  petro: {
    950: '#07090C',
    900: '#0A0E13',
    800: '#12181F',
    700: '#1A222B',
    600: '#232D38',
    500: '#333F4C',
    400: '#5A6A78',
    300: '#8A97A3',
    200: '#C6CDD3',
    100: '#E7ECF0',
    50: '#F5F7F8',
  },
  paper: {
    950: '#0F1216',
    900: '#10151B',
    50: '#F6F5F2',
    100: '#EDEBE5',
    200: '#E2DFD6',
  },
  commodity,
};

const fonts = {
  heading: `'Space Grotesk', 'Inter', sans-serif`,
  body: `'Inter', -apple-system, sans-serif`,
  mono: `'IBM Plex Mono', 'SFMono-Regular', monospace`,
};

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const styles = {
  global: (props: StyleFunctionProps) => ({
    'html, body': {
      bg: props.colorMode === 'dark' ? 'petro.900' : 'paper.50',
      color: props.colorMode === 'dark' ? 'petro.100' : 'petro.900',
      fontFeatureSettings: '"tnum" 1, "cv11" 1',
    },
    '::selection': {
      background: 'brand.500',
      color: 'white',
    },
    '*::-webkit-scrollbar': { width: '8px', height: '8px' },
    '*::-webkit-scrollbar-thumb': {
      background: props.colorMode === 'dark' ? 'petro.600' : 'paper.200',
      borderRadius: '8px',
    },
  }),
};

const semanticTokens = {
  colors: {
    surface: { default: 'white', _dark: 'petro.800' },
    surfaceAlt: { default: 'paper.100', _dark: 'petro.700' },
    canvas: { default: 'paper.50', _dark: 'petro.900' },
    border: { default: 'paper.200', _dark: 'petro.700' },
    textMuted: { default: 'petro.400', _dark: 'petro.300' },
    textPrimary: { default: 'petro.900', _dark: 'petro.100' },
  },
};

const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      letterSpacing: '0.01em',
    },
    variants: {
      solid: {
        bg: 'brand.500',
        color: 'white',
        _hover: { bg: 'brand.400' },
        _active: { bg: 'brand.600' },
      },
      ghost: (props: StyleFunctionProps) => ({
        color: props.colorMode === 'dark' ? 'petro.200' : 'petro.700',
        _hover: { bg: props.colorMode === 'dark' ? 'petro.700' : 'paper.100' },
      }),
    },
  },
  Badge: {
    baseStyle: {
      borderRadius: 'full',
      px: 2,
      py: 0.5,
      fontWeight: '600',
      letterSpacing: '0.04em',
    },
  },
  Heading: {
    baseStyle: {
      letterSpacing: '-0.01em',
    },
  },
};

const theme = extendTheme({
  config,
  colors,
  fonts,
  styles,
  semanticTokens,
  components,
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
});

export default theme;
