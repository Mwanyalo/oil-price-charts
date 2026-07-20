import { Button, HStack } from '@chakra-ui/react';
import { humanizeCategory } from '../../data/catalog';

interface CategoryTabsProps {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
}

function TabButton({
  isActive,
  onClick,
  children,
}: {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      flexShrink={0}
      borderRadius="999px"
      border="1px solid"
      borderColor={isActive ? 'var(--text-primary)' : 'var(--border)'}
      bg={isActive ? 'var(--text-primary)' : 'transparent'}
      color={isActive ? 'var(--canvas)' : 'var(--text-muted)'}
      fontSize="0.8rem"
      fontWeight={600}
      padding="0.4rem 0.9rem"
      height="auto"
      _hover={{
        bg: isActive ? 'var(--text-primary)' : 'var(--border)',
      }}
    >
      {children}
    </Button>
  );
}

export function CategoryTabs({
  categories,
  active,
  onChange,
}: CategoryTabsProps) {
  return (
    <HStack spacing={2} overflowX="auto" paddingBottom="4px">
      <TabButton isActive={active === null} onClick={() => onChange(null)}>
        All
      </TabButton>
      {categories.map((cat) => (
        <TabButton
          key={cat}
          isActive={active === cat}
          onClick={() => onChange(cat)}
        >
          {humanizeCategory(cat)}
        </TabButton>
      ))}
    </HStack>
  );
}
