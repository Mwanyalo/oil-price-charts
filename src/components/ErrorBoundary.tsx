import { Component, type ErrorInfo, type ReactNode } from 'react';
import { VStack, Heading, Text, Button, Code, Box } from '@chakra-ui/react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('Crude Signal crashed:', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <VStack
          minH='100vh'
          justify='center'
          px={6}
          py={10}
          bg='#0A0E13'
          color='#E7ECF0'
          spacing={4}
          textAlign='center'
        >
          <Text
            fontFamily="'IBM Plex Mono', monospace"
            fontSize='xs'
            color='#D64545'
            fontWeight='700'
          >
            RENDER ERROR
          </Text>
          <Heading fontSize='xl' fontFamily="'Space Grotesk', sans-serif">
            Something broke the feed
          </Heading>
          <Box
            maxW='520px'
            bg='#12181F'
            border='1px solid #1A222B'
            borderRadius='md'
            p={4}
          >
            <Code
              display='block'
              whiteSpace='pre-wrap'
              bg='transparent'
              color='#C6CDD3'
              fontSize='xs'
              textAlign='left'
            >
              {this.state.error.message}
            </Code>
          </Box>
          <Button onClick={() => window.location.reload()} colorScheme='orange'>
            Reload
          </Button>
        </VStack>
      );
    }
    return this.props.children;
  }
}
