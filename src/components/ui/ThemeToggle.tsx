import {
  IconButton,
  useColorMode,
  Tooltip,
  type IconButtonProps,
} from '@chakra-ui/react';
import { FiSun, FiMoon } from 'react-icons/fi';

export const ThemeToggle = (props: Partial<IconButtonProps>) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  return (
    <Tooltip
      label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      hasArrow
    >
      <IconButton
        aria-label='Toggle color mode'
        icon={isDark ? <FiSun /> : <FiMoon />}
        onClick={toggleColorMode}
        variant='ghost'
        borderRadius='full'
        size='sm'
        {...props}
      />
    </Tooltip>
  );
};
