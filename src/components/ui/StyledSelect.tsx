import {
  Menu,
  MenuButton,
  MenuList,
  MenuOptionGroup,
  MenuItemOption,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiChevronDown } from 'react-icons/fi';

export interface StyledSelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface StyledSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: StyledSelectOption<T>[];
  size?: 'sm' | 'md';
  minW?: string;
  isDisabled?: boolean;
  'aria-label'?: string;
}

export const StyledSelect = <T extends string = string>({
  value,
  onChange,
  options,
  size = 'sm',
  minW = '110px',
  isDisabled,
  'aria-label': ariaLabel,
}: StyledSelectProps<T>) => {
  const border = useColorModeValue('paper.200', 'petro.700');
  const surface = useColorModeValue('white', 'petro.800');
  const hoverBg = useColorModeValue('paper.100', 'petro.700');
  const selectedColor = useColorModeValue('brand.600', 'brand.400');
  const current = options.find((o) => o.value === value);

  return (
    <Menu placement='bottom-start' isLazy>
      <MenuButton
        as={Button}
        size={size}
        variant='outline'
        borderColor={border}
        bg={surface}
        fontWeight='600'
        rightIcon={<FiChevronDown size={14} />}
        minW={minW}
        textAlign='left'
        isDisabled={isDisabled}
        aria-label={ariaLabel}
        _hover={{ bg: hoverBg }}
        _active={{ bg: hoverBg }}
      >
        {current?.label ?? 'Select'}
      </MenuButton>
      <MenuList
        bg={surface}
        borderColor={border}
        minW={minW}
        py={1}
        fontSize='sm'
        boxShadow='lg'
        zIndex={30}
      >
        <MenuOptionGroup
          value={value}
          type='radio'
          onChange={(v) => onChange(v as T)}
        >
          {options.map((opt) => (
            <MenuItemOption
              key={opt.value}
              value={opt.value}
              fontSize='sm'
              _checked={{ color: selectedColor, fontWeight: '700' }}
              _hover={{ bg: hoverBg }}
              _focus={{ bg: hoverBg }}
            >
              {opt.label}
            </MenuItemOption>
          ))}
        </MenuOptionGroup>
      </MenuList>
    </Menu>
  );
};
