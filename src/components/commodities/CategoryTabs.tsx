import { HStack, Button, Box, useColorModeValue } from '@chakra-ui/react';

const humanize = (slug: string) =>
  slug
    .split('_')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');

interface CategoryTabsProps {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
}

export const CategoryTabs = ({
  categories,
  active,
  onChange,
}: CategoryTabsProps) => {
  const activeBg = useColorModeValue('petro.900', 'petro.100');
  const activeColor = useColorModeValue('white', 'petro.900');

  return (
    <Box
      overflowX='auto'
      pb={1}
      sx={{
        scrollbarWidth: 'none',
        '::-webkit-scrollbar': { display: 'none' },
      }}
    >
      <HStack spacing={2} w='max-content'>
        <Button
          size='sm'
          borderRadius='full'
          onClick={() => onChange(null)}
          bg={active === null ? activeBg : undefined}
          color={active === null ? activeColor : undefined}
          _hover={active === null ? { bg: activeBg } : undefined}
          variant={active === null ? 'solid' : 'ghost'}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            size='sm'
            borderRadius='full'
            onClick={() => onChange(cat)}
            bg={active === cat ? activeBg : undefined}
            color={active === cat ? activeColor : undefined}
            _hover={active === cat ? { bg: activeBg } : undefined}
            variant={active === cat ? 'solid' : 'ghost'}
            flexShrink={0}
          >
            {humanize(cat)}
          </Button>
        ))}
      </HStack>
    </Box>
  );
};
