import { useMemo } from 'react';
import { useWatchlist } from '../context/WatchlistContext';
import { buildColorMap } from '../utils/commodityColor';

export const useCommodityColors = (): Record<string, string> => {
  const { codes } = useWatchlist();
  return useMemo(() => buildColorMap(codes), [codes]);
};
