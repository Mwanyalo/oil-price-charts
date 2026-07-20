import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

const sweep = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(350%); }
`;

interface LineLoaderProps {
  active: boolean;
}

export const LineLoader = ({ active }: LineLoaderProps) => {
  if (!active) return null;
  return (
    <Box
      position='absolute'
      top={0}
      left={0}
      right={0}
      height='2px'
      overflow='hidden'
      zIndex={2}
      borderTopRadius='lg'
    >
      <Box
        position='absolute'
        top={0}
        left={0}
        height='100%'
        width='30%'
        bgGradient='linear(to-r, transparent, brand.500, transparent)'
        animation={`${sweep} 1.1s ease-in-out infinite`}
      />
    </Box>
  );
};
