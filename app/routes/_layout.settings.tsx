import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Switch,
  Text,
} from '@chakra-ui/react';
import { useWatchlist } from '../context/watchlist';
import { useCatalog } from '../context/catalog';
import { humanizeCategory } from '~/data/catalog';

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardBody>
        <Text
          color='var(--text-muted)'
          fontSize='0.75rem'
          textTransform='uppercase'
          letterSpacing='0.04em'
          marginBottom='10px'
        >
          {title}
        </Text>
        <Flex
          direction='column'
          gap='10px'
          borderTop='1px solid var(--border)'
          paddingTop='12px'
        >
          {children}
        </Flex>
      </CardBody>
    </Card>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <Flex justify='space-between' align='center'>
      {children}
    </Flex>
  );
}

export default function Settings() {
  const { codes, untrack, maxSize } = useWatchlist();
  const { byCode } = useCatalog();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    setTheme(stored === 'light' ? 'light' : 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    window.localStorage.setItem('theme', next);
  };

  return (
    <Flex direction='column' gap='1.5rem'>
      <Heading fontSize='1.5rem'>Settings</Heading>

      <Section title='Appearance'>
        <Row>
          <Box>
            <Text fontWeight={600} fontSize='0.85rem'>
              Dark mode
            </Text>
            <Text color='var(--text-muted)' fontSize='0.75rem'>
              Applies across the app, saved to this browser.
            </Text>
          </Box>
          <Switch
            isChecked={theme === 'dark'}
            onChange={toggleTheme}
            colorScheme='orange'
          />
        </Row>
      </Section>

      <Section title='Watchlist'>
        <Text color='var(--text-muted)' fontSize='0.8rem' marginTop={0}>
          Tracking {codes.length}/{maxSize}. Manage what's tracked here or from
          the Markets page.
        </Text>
        <Flex direction='column' gap='8px'>
          {codes.map((code) => (
            <Row key={code}>
              <Text fontSize='0.85rem'>
                {byCode[code]?.name || humanizeCategory(code)}
              </Text>
              <Button
                isDisabled={codes.length <= 1}
                onClick={() => untrack(code)}
                fontFamily='var(--font-body)'
                fontWeight={600}
                fontSize='0.78rem'
                padding='0.35rem 0.7rem'
                height='auto'
                borderRadius='6px'
                border='1px solid var(--border)'
                bg='transparent'
                color='var(--text-primary)'
                _hover={{ bg: 'var(--border)' }}
              >
               - Untrack
              </Button>
            </Row>
          ))}
        </Flex>
      </Section>
    </Flex>
  );
}
