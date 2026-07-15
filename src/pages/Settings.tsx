import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Divider,
  useColorModeValue,
  useColorMode,
  Switch,
  type BoxProps,
} from '@chakra-ui/react';

interface SectionProps extends Pick<BoxProps, 'children'> {
  title: string;
  surface: string;
  border: string;
}

const Section = ({ title, children, surface, border }: SectionProps) => (
  <Box
    bg={surface}
    border='1px solid'
    borderColor={border}
    borderRadius='lg'
    p={{ base: 4, md: 5 }}
  >
    <Heading
      fontSize='sm'
      mb={3}
      color='textMuted'
      letterSpacing='0.02em'
      textTransform='uppercase'
    >
      {title}
    </Heading>
    <Divider mb={3} borderColor={border} />
    {children}
  </Box>
);

export const Settings = () => {
  const surface = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <VStack align='stretch' spacing={6} >
      <Box>
        <Heading fontSize={{ base: 'xl', md: '2xl' }}>Settings</Heading>
      </Box>

      <Section title='Appearance' surface={surface} border={border}>
        <HStack justify='space-between'>
          <Box>
            <Text fontWeight='600' fontSize='sm'>
              Dark mode
            </Text>
            <Text fontSize='xs' color='textMuted'>
              Applies theme.
            </Text>
          </Box>
          <Switch
            colorScheme='orange'
            isChecked={colorMode === 'dark'}
            onChange={toggleColorMode}
          />
        </HStack>
      </Section>
    </VStack>
  );
};
