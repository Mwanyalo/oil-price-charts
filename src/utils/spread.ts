import type { HistoryPoint } from '../types/oil';

export interface SpreadPoint {
  time: string;
  spread: number;
}

/**
 * Builds a - b over time from two independently fetched history series.
 */
export const buildSpread = (
  a: HistoryPoint[],
  b: HistoryPoint[],
): SpreadPoint[] => {
  if (a.length === 0 || b.length === 0) return [];

  const sortByTime = (series: HistoryPoint[]) =>
    [...series]
      .map((p) => ({ ...p, ms: new Date(p.time).getTime() }))
      .filter((p) => Number.isFinite(p.ms))
      .sort((x, y) => x.ms - y.ms);

  const as = sortByTime(a);
  const bs = sortByTime(b);
  if (as.length === 0 || bs.length === 0) return [];

  const avgGap = (series: { ms: number }[]) => {
    if (series.length < 2) return Infinity;
    let total = 0;
    for (let i = 1; i < series.length; i++)
      total += series[i].ms - series[i - 1].ms;
    return total / (series.length - 1);
  };
  const tolerance = Math.max(avgGap(as), avgGap(bs), 15 * 60 * 1000); // at least 15 min

  const result: SpreadPoint[] = [];
  let j = 0;
  for (const point of as) {
    while (
      j < bs.length - 1 &&
      Math.abs(bs[j + 1].ms - point.ms) <= Math.abs(bs[j].ms - point.ms)
    ) {
      j++;
    }
    const match = bs[j];
    if (Math.abs(match.ms - point.ms) <= tolerance) {
      result.push({
        time: point.time,
        spread: Number((point.price - match.price).toFixed(2)),
      });
    }
  }
  return result;
};
