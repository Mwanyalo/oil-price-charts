export type CommodityCode = string;

export interface Commodity {
  code: CommodityCode;
  name: string;
  currency: string;
  category: string;
  description: string;
  unit: string;
  unit_description: string;
  multiplier: number;
  validation?: { min: number; max: number };
  price_change_threshold?: number;
  data_source: string | null;
  update_frequency: string;
}

export interface LatestPrice {
  code: CommodityCode;
  price: number;
  formatted: string;
  currency: string;
  unit: string;
  timestamp: string;
}

export interface HistoryPoint {
  time: string;
  price: number;
}

export type PriceRange = 'past_day' | 'past_week' | 'past_month';

export interface SeriesChange {
  abs: number;
  pct: number;
}
