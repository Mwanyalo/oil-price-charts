export const CHART_PALETTE = [
  '#E8672E',
  '#2FBEB0',
  '#E0B23C',
  '#7C9EFF',
  '#E85D9E',
  '#4FD1C5',
];

export const buildColorMap = (codes: string[]): Record<string, string> => {
  const map: Record<string, string> = {};
  codes.forEach((code, i) => {
    map[code] = CHART_PALETTE[i % CHART_PALETTE.length];
  });
  return map;
};
