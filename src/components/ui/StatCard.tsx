import {
  Box,
  HStack,
  Text,
  Badge,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiArrowUpRight,
  FiArrowDownRight,
  FiX,
  FiActivity,
} from 'react-icons/fi';
import { SparklineChart } from '../charts/SparklineChart';
import { formatPrice, formatPercent } from '../../utils/format';
import type { HistoryPoint } from '../../types/oil';

interface StatCardProps {
  label: string;
  price?: number | null;
  currency?: string;
  unit?: string;
  changePct?: number | null;
  sparkline?: HistoryPoint[] | null;
  accent: string;
  onClick?: () => void;
  onRemove?: () => void;
  isActive?: boolean;
}

export const StatCard = ({
  label,
  price,
  currency,
  unit,
  changePct,
  sparkline,
  accent,
  onClick,
  onRemove,
  isActive,
}: StatCardProps) => {
  const surface = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');
  const up = (changePct ?? 0) >= 0;

  return (
    <Box
      as={onClick ? 'button' : 'div'}
      onClick={onClick}
      position='relative'
      bg={isActive ? `${accent}12` : surface}
      border='1.5px solid'
      borderColor={isActive ? accent : border}
      boxShadow={isActive ? `0 0 0 3px ${accent}2A` : 'none'}
      borderRadius='lg'
      p={4}
      textAlign='left'
      w='full'
      transition='all 0.15s ease'
      _hover={onClick ? { borderColor: accent } : undefined}
    >
      {onRemove && (
        <IconButton
          aria-label={`Stop tracking ${label}`}
          icon={<FiX size={13} />}
          size='xs'
          variant='ghost'
          position='absolute'
          top={2}
          right={2}
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}

      <HStack
        justify='space-between'
        align='start'
        mb={1}
        pr={onRemove ? 6 : 0}
      >
        <HStack spacing={2}>
          <Box w='8px' h='8px' borderRadius='full' bg={accent} />
          <Text
            fontFamily='heading'
            fontWeight='600'
            fontSize='sm'
            color='textMuted'
          >
            {label}
          </Text>
        </HStack>
        {changePct != null && (
          <Badge
            colorScheme={up ? 'green' : 'red'}
            variant='subtle'
            display='flex'
            alignItems='center'
            gap='2px'
            fontFamily='mono'
          >
            {up ? <FiArrowUpRight size={11} /> : <FiArrowDownRight size={11} />}
            {formatPercent(changePct)}
          </Badge>
        )}
      </HStack>

      <Text
        fontFamily='mono'
        fontWeight='700'
        fontSize={{ base: 'xl', md: '2xl' }}
        lineHeight='1.2'
      >
        {formatPrice(price, { currency })}
      </Text>
      <HStack justify='space-between' mb={2}>
        <Text fontSize='xs' color='textMuted'>
          per {unit || 'barrel'}
        </Text>
        {isActive && (
          <HStack spacing={1} color={accent}>
            <FiActivity size={11} />
            <Text
              fontSize='10px'
              fontWeight='700'
              letterSpacing='0.04em'
              textTransform='uppercase'
            >
              Charting
            </Text>
          </HStack>
        )}
      </HStack>

      <SparklineChart data={sparkline} colorToken={accent} />
    </Box>
  );
};
