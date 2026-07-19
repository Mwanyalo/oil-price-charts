export interface DataSourceConfig<P = any> {
  id: string;
  buildUrl: (params: P) => string;
  headers?: Record<string, string>;
}

export const DATASOURCES = {
  series: {
    id: 'series',
    buildUrl: (params: { code: string; range: string }) =>
      `/resources/series?code=${encodeURIComponent(params.code)}&range=${encodeURIComponent(params.range)}`,
  },
  latest: {
    id: 'latest',
    buildUrl: (params: { codes: string[] }) =>
      `/resources/latest?codes=${encodeURIComponent(params.codes.join(','))}`,
  },
  commodities: {
    id: 'commodities',
    buildUrl: () => '/resources/commodities',
  },
} satisfies Record<string, DataSourceConfig<any>>;

export type DataSourceId = keyof typeof DATASOURCES;
