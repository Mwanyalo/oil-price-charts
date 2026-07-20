import { Box, Card, CardBody, Flex, IconButton, Text } from '@chakra-ui/react';
import { Sparkline } from '../charts/Sparkline';
import {
  formatPrice,
  formatPercent,
  type HistoryPoint,
} from '../../data/priceFormat';
import { X } from 'lucide-react';

interface StatCardProps {
  label: string;
  price?: number | null;
  currency?: string;
  unit?: string;
  changePct?: number | null;
  sparkline?: HistoryPoint[] | null;
  accent: string;
  isActive?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  note?: string;
}

export function StatCard({
  label,
  price,
  currency,
  unit,
  changePct,
  sparkline,
  accent,
  isActive,
  onClick,
  onRemove,
  note,
}: StatCardProps) {
  const up = (changePct ?? 0) >= 0;

  return (
    <Card
      onClick={onClick}
      borderColor={isActive ? accent : 'var(--border)'}
      cursor={onClick ? 'pointer' : undefined}
    >
      <CardBody>
        {onRemove && (
          <IconButton
            aria-label={`Stop tracking ${label}`}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            icon={<X size={16}  />}
            variant='ghost'
            size='sm'
            position='absolute'
            top='10px'
            right='10px'
            minWidth='auto'
            color='var(--text-muted)'
            _hover={{ bg: 'var(--border)' }}
          />
        )}

        <Flex
          justify='space-between'
          align='start'
          marginBottom='4px'
          paddingRight={onRemove ? '24px' : 0}
        >
          <Flex align='center' gap='8px'>
            <Box
              width='8px'
              height='8px'
              borderRadius='50%'
              bg={accent}
              flexShrink={0}
            />
            <Text fontWeight={600} fontSize='0.85rem' color='#8b8b90'>
              {label}
            </Text>
          </Flex>
          {changePct != null && (
            <Flex
              align='center'
              gap='2px'
              fontFamily='var(--font-mono)'
              fontSize='0.75rem'
              fontWeight={600}
              color={up ? '#5fa87c' : '#c96b6b'}
            >
              {up ? '▲' : '▼'} {formatPercent(changePct)}
            </Flex>
          )}
        </Flex>

        <Text
          fontFamily='var(--font-mono)'
          fontWeight={700}
          fontSize='1.5rem'
          lineHeight={1.2}
        >
          {formatPrice(price, currency)}
        </Text>
        <Flex justify='space-between' marginBottom='8px'>
          <Text fontSize='0.75rem' color='#8b8b90'>
            per {unit || 'unit'}
          </Text>
          {isActive && (
            <Text
              fontSize='0.65rem'
              fontWeight={700}
              letterSpacing='0.04em'
              textTransform='uppercase'
              color={accent}
            >
              Charting
            </Text>
          )}
        </Flex>

        <Sparkline data={sparkline} color={accent} />
        {note && (
          <Text
            fontSize='0.68rem'
            color='#c96b6b'
            marginTop='6px'
            marginBottom={0}
          >
            {note}
          </Text>
        )}
      </CardBody>
    </Card>
  );
}
