import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Badge,
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiX } from 'react-icons/fi';
import type { Commodity, LatestPrice } from '../../types/oil';
import { formatPrice } from '../../utils/format';

const humanize = (slug: string) =>
  slug
    .split('_')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');

interface CommodityCardProps {
  commodity: Commodity;
  tracked: boolean;
  atLimit?: boolean;
  canUntrack?: boolean;
  latestPrice?: LatestPrice | null;
  onToggle: () => void;
}

export const CommodityCard = ({
  commodity,
  tracked,
  atLimit,
  canUntrack = true,
  latestPrice,
  onToggle,
}: CommodityCardProps) => {
  const surface = useColorModeValue('white', 'petro.800');
  const border = useColorModeValue('paper.200', 'petro.700');
  const trackedBorder = useColorModeValue('brand.400', 'brand.500');

  const isDisabled = tracked ? !canUntrack : Boolean(atLimit);
  const tooltipLabel = tracked
    ? !canUntrack
      ? 'Keep at least one commodity tracked'
      : ''
    : atLimit
      ? "You're tracking 6/6 — untrack one to add another"
      : '';

  return (
    <Box
      bg={surface}
      border='1px solid'
      borderColor={tracked ? trackedBorder : border}
      borderRadius='lg'
      p={4}
    >
      <VStack align='stretch' spacing={2}>
        <HStack justify='space-between' align='start'>
          <VStack align='start' spacing={0}>
            <Text fontWeight='600' fontSize='sm' noOfLines={1}>
              {commodity.name}
            </Text>
            <Text fontFamily='mono' fontSize='xs' color='textMuted'>
              {commodity.code}
            </Text>
          </VStack>
          <Badge variant='subtle' colorScheme='gray' fontSize='9px'>
            {humanize(commodity.category)}
          </Badge>
        </HStack>

        {latestPrice ? (
          <Text fontFamily='mono' fontWeight='700' fontSize='lg'>
            {formatPrice(latestPrice.price, { currency: latestPrice.currency })}
          </Text>
        ) : (
          <Text fontSize='xs' color='textMuted' noOfLines={2} minH='32px'>
            {commodity.description}
          </Text>
        )}

        <HStack justify='space-between' pt={1}>
          <Text fontSize='10px' color='textMuted' fontFamily='mono'>
            updates {commodity.update_frequency} · per {commodity.unit}
          </Text>
          <Tooltip
            label={tooltipLabel}
            isDisabled={!tooltipLabel}
            hasArrow
            placement='top'
          >
            <Box display='inline-block' tabIndex={isDisabled ? 0 : undefined}>
              <Button
                size='xs'
                variant={tracked ? 'outline' : 'solid'}
                colorScheme={tracked ? 'red' : undefined}
                leftIcon={tracked ? <FiX size={12} /> : <FiPlus size={12} />}
                onClick={onToggle}
                isDisabled={isDisabled}
                pointerEvents={isDisabled ? 'none' : undefined}
              >
                {tracked ? 'Untrack' : 'Track'}
              </Button>
            </Box>
          </Tooltip>
        </HStack>
      </VStack>
    </Box>
  );
};
