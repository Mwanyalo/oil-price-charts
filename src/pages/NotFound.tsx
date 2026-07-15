import { VStack, Heading, Text, Button } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

export const NotFound = () => (
  <VStack
    align='center'
    justify='center'
    minH='60vh'
    spacing={3}
    textAlign='center'
  >
    <Heading fontSize='2xl'>Page not Fould</Heading>
    <Button as={RouterLink} to='/' mt={2}>
      Back to Dashboard
    </Button>
  </VStack>
);
