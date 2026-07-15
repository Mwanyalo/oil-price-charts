import {
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Code,
  Link,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiExternalLink } from 'react-icons/fi';
import { ThemeToggle } from './ui/ThemeToggle';

export const ApiKeyGate = () => {
  const surface = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');

  return (
    <VStack
      minH='100vh'
      justify='center'
      px={4}
      py={10}
      bg='canvas'
      spacing={6}
    >
      <HStack position='absolute' top={4} right={4}>
        <ThemeToggle />
      </HStack>

      <VStack spacing={1}>
        <Box
          w='12px'
          h='12px'
          borderRadius='3px'
          bg='brand.500'
          transform='rotate(45deg)'
        />
        <Heading fontFamily='heading' fontSize='lg' mt={2}>
          Oil Prices
        </Heading>
      </VStack>

      <VStack
        align='stretch'
        spacing={4}
        bg={surface}
        border='1px solid'
        borderColor={border}
        borderRadius='lg'
        p={6}
        maxW='480px'
        w='full'
      >
        <Box>
          <Text
            fontFamily='mono'
            fontSize='xs'
            color='commodity.gas'
            fontWeight='700'
            mb={1}
          >
            NO FEED CONNECTED
          </Text>
          <Heading fontSize='xl'>Connect a live price feed</Heading>
        </Box>

        <Text fontSize='sm' color='textMuted'>
         Get a free key in order to view the dashboard.
        </Text>

        <VStack align='stretch' spacing={2} fontSize='sm'>
          <HStack>
            <Text fontWeight='700'>1.</Text>
            <Text>
              Create a free key at{' '}
              <Link
                href='https://www.oilpriceapi.com/'
                isExternal
                color='brand.500'
              >
                oilpriceapi.com <FiExternalLink style={{ display: 'inline' }} />
              </Link>{' '}
              — no card required.
            </Text>
          </HStack>
          <HStack align='start'>
            <Text fontWeight='700'>2.</Text>
            <Text>
              Update <Code>.env</Code> and set:
            </Text>
          </HStack>
          <Box
            bg='canvas'
            border='1px solid'
            borderColor={border}
            borderRadius='md'
            p={3}
            ml={5}
          >
            <Text fontFamily='mono' fontSize='xs'>
              VITE_OILPRICE_API_KEY=your_token_here
            </Text>
             <Text fontFamily='mono' fontSize='xs'>
              VITE_BASE_API=oilprice_api_url
            </Text>
          </Box>
          <HStack>
            <Text fontWeight='700'>3.</Text>
            <Text>Restart the dev server.</Text>
          </HStack>
        </VStack>

        <Button
          as={Link}
          href='https://www.oilpriceapi.com/'
          isExternal
          _hover={{ textDecoration: 'none' }}
          rightIcon={<FiExternalLink />}
        >
          Get a free API key
        </Button>
      </VStack>
    </VStack>
  );
};
