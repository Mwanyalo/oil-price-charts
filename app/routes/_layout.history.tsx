import { Form, useNavigation, useSubmit } from 'react-router';
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Select,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import type { Route } from './+types/_layout.history';
import { TrendChart } from '../components/charts/TrendChart';
import { useWatchlist } from '../context/watchlist';
import { useCatalog } from '../context/catalog';
import { useLiveData } from '../context/dataProvider';
import { buildColorMap } from '../data/catalog';
import {
  seriesChange,
  formatPrice,
  formatPercent,
  type HistoryPoint,
  type PriceRange,
} from '../data/priceFormat';

const RANGE_OPTIONS: { value: PriceRange; label: string }[] = [
  { value: 'past_day', label: '24 hours' },
  { value: 'past_week', label: '7 days' },
  { value: 'past_month', label: '30 days' },
];

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  return {
    code: url.searchParams.get('code') || '',
    range: (url.searchParams.get('range') as PriceRange) || 'past_month',
  };
}

function StatBlock({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down';
}) {
  const color =
    tone === 'up' ? '#5fa87c' : tone === 'down' ? '#c96b6b' : undefined;
  return (
    <Card>
      <CardBody>
        <Text color='var(--text-muted)' fontSize='0.72rem' marginBottom='4px'>
          {label}
        </Text>
        <Text
          fontFamily='var(--font-mono)'
          fontWeight={700}
          fontSize='1.05rem'
          color={color}
        >
          {value}
        </Text>
      </CardBody>
    </Card>
  );
}

export default function History({ loaderData }: Route.ComponentProps) {
  const { codes } = useWatchlist();
  const { byCode } = useCatalog();
  const submit = useSubmit();
  const { code, range } = loaderData;
  const selectedCode = code || codes[0] || '';
  const meta = byCode[selectedCode];
  const accent = buildColorMap(codes)[selectedCode] || '#8A97A3';
  const {
    data,
    isLoading: isFetching,
    refresh,
  } = useLiveData<{
    code: string;
    range: string;
    data: HistoryPoint[];
    error?: string;
  }>('series', { code: selectedCode, range }, { live: { enabled: false } });
  const chartData = data?.data ?? [];
  const errorMessage = data?.error;
  const stats = chartData.length
    ? {
        high: Math.max(...chartData.map((point) => point.price)),
        low: Math.min(...chartData.map((point) => point.price)),
        avg:
          chartData.reduce((total, point) => total + point.price, 0) /
          chartData.length,
        changePct: seriesChange(chartData).pct,
      }
    : null;

  return (
    <Flex direction='column' gap='1.5rem'>
      <Flex justify='space-between' wrap='wrap' gap='12px'>
        <Box>
          <Heading fontSize='1.5rem'>History</Heading>
          <Text color='var(--text-muted)' fontSize='0.85rem' marginTop='4px'>
            A single fetch per range change no live polling needed for a
            backward looking view.
          </Text>
        </Box>
        <Form
          method='get'
          style={{ display: 'flex', gap: 8 }}
          onChange={(event) => submit(event.currentTarget)}
        >
          <Select name='code' defaultValue={selectedCode} width='auto'>
            {codes.map((value) => (
              <option key={value} value={value}>
                {byCode[value]?.name || value}
              </option>
            ))}
          </Select>
          <Select name='range' defaultValue={range} width='auto'>
            {RANGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Form>
      </Flex>
      {stats && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <StatBlock
            label='High'
            value={formatPrice(stats.high, meta?.currency)}
          />
          <StatBlock
            label='Low'
            value={formatPrice(stats.low, meta?.currency)}
          />
          <StatBlock
            label='Average'
            value={formatPrice(stats.avg, meta?.currency)}
          />
          <StatBlock
            label='Change'
            value={formatPercent(stats.changePct)}
            tone={stats.changePct >= 0 ? 'up' : 'down'}
          />
        </SimpleGrid>
      )}
      <Card>
        <CardBody>
          <Flex
            justify='space-between'
            align='center'
            wrap='wrap'
            gap='12px'
            marginBottom='16px'
          >
            <Flex align='center' gap='8px'>
              <Box width='8px' height='8px' borderRadius='50%' bg={accent} />
              <Heading fontSize='1rem'>
                {meta?.name || selectedCode} —{' '}
                {RANGE_OPTIONS.find((option) => option.value === range)?.label}
              </Heading>
            </Flex>
            <Flex align='center' gap='10px'>
              <Text
                fontFamily='var(--font-mono)'
                color='var(--text-muted)'
                fontSize='0.72rem'
              >
                ON DEMAND
              </Text>
              <Button
                onClick={() => refresh()}
                isDisabled={isFetching}
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
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
            </Flex>
          </Flex>
          {errorMessage ? (
            <Text color='var(--text-muted)' fontSize='0.85rem'>
              {errorMessage}
            </Text>
          ) : (
            <TrendChart
              data={chartData}
              color={accent}
              currency={meta?.currency}
              height={320}
              loading={isFetching}
            />
          )}
        </CardBody>
      </Card>
    </Flex>
  );
}
