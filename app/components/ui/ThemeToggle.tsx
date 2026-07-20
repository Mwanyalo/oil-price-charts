import { IconButton, Tooltip, useColorMode } from '@chakra-ui/react';
import { Moon, Sun } from 'lucide-react';

export function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <Tooltip
      label={colorMode === 'dark' ? 'Light mode' : 'Dark mode'}
      fontSize='sm'
    >
      <IconButton
        aria-label='Toggle color mode'
        icon={colorMode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        onClick={toggleColorMode}
        variant='ghost'
        borderRadius='full'
        size='sm'
      />
    </Tooltip>
  );
}
