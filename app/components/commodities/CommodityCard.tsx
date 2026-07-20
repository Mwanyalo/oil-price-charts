import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Text,
} from '@chakra-ui/react';
import { humanizeCategory, type Commodity } from '../../data/catalog';
import { Minus, Plus } from 'lucide-react';

interface CommodityCardProps {
  commodity: Commodity;
  tracked: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onToggle: () => void;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <Badge
      display='inline-block'
      padding='2px 8px'
      borderRadius='999px'
      bg='var(--border)'
      color='var(--text-muted)'
      fontSize='0.65rem'
      fontWeight={600}
      whiteSpace='nowrap'
      textTransform='none'
    >
      {children}
    </Badge>
  );
}

export function CommodityCard({
  commodity,
  tracked,
  disabled,
  disabledReason,
  onToggle,
}: CommodityCardProps) {
  return (
    <Card>
      <CardBody>
        <Flex justify='space-between' align='start' marginBottom='6px'>
          <Box>
            <Text fontWeight={600} fontSize='0.9rem'>
              {commodity.name}
            </Text>
          </Box>
          <Pill>{humanizeCategory(commodity.category)}</Pill>
        </Flex>
        <Text fontSize='0.78rem' color='#8b8b90' minHeight='34px' marginTop={0}>
          {commodity.description}
        </Text>
        <Flex justify='space-between' align='center' paddingTop='4px' gap='6px'>
          <Text
            fontSize='0.68rem'
            color='#8b8b90'
            fontFamily='var(--font-mono)'
          >
            per {commodity.unit}
          </Text>
          {commodity.updateFrequency && (
            <Pill>{commodity.updateFrequency}</Pill>
          )}
          <Button
            onClick={onToggle}
            isDisabled={disabled}
            title={disabled ? disabledReason : undefined}
            fontFamily='var(--font-body)'
            fontWeight={600}
            fontSize='0.78rem'
            padding='0.35rem 0.7rem'
            height='auto'
            borderRadius='6px'
            border='1px solid'
            borderColor={tracked ? 'var(--border)' : 'var(--brand)'}
            bg={tracked ? 'transparent' : 'var(--brand)'}
            color={tracked ? 'var(--text-primary)' : 'white'}
            _hover={{
              bg: tracked ? 'var(--border)' : 'var(--brand)',
              opacity: tracked ? 1 : 0.9,
            }}
          >
            {tracked ? (
              <>
                <Minus size={10} />
                <span>Untrack</span>
              </>
            ) : (
              <>
                <Plus size={10} />
                <span>Track</span>
              </>
            )}
          </Button>
        </Flex>
      </CardBody>
    </Card>
  );
}
