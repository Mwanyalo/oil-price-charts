export interface Commodity {
  code: string;
  name: string;
  category: string;
  currency: string;
  unit: string;
  description: string;
  unitDescription?: string;
  updateFrequency?: string;
}

const CHART_PALETTE = [
  '#E8672E',
  '#2FBEB0',
  '#E0B23C',
  '#7C9EFF',
  '#E85D9E',
  '#4FD1C5',
];

export function buildColorMap(codes: string[]): Record<string, string> {
  return Object.fromEntries(
    codes.map((code) => {
      const index = [...code].reduce(
        (sum, character) => sum + character.charCodeAt(0),
        0,
      );
      return [code, CHART_PALETTE[index % CHART_PALETTE.length]];
    }),
  );
}

export function humanizeCategory(slug: string): string {
  return slug
    .split('_')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}
