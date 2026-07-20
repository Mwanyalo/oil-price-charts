# rr-vite-express

A React Router 8 (SSR/framework mode) + Vite + Express starter, built out into a small
live oil-price dashboard to demonstrate the stack end-to-end: server rendering, resource
routes, a centralized live-data provider, and a real third-party API integration.

## Stack

- **React Router 8** — routing, SSR, and data loading (`loader`s + resource routes)
- **Vite** — dev server and bundling, via `@react-router/dev`'s Vite plugin
- **Express** — the actual HTTP server (`server.js`), with `compression` + `morgan`
- **[OilPriceAPI](https://www.oilpriceapi.com/)** — real commodity price data

## Quick Start

Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with these values:

```
OILPRICEAPI_KEY=your_api_key_here
BASE_API=https://api.oilpriceapi.com/v1
```

Get a free API key at https://www.oilpriceapi.com/ (or use your own provider).

Run the app in development mode:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Start the production server:

```bash
npm run start
```

````

## Project structure

```
app/
  data/
    catalog.ts             commodity list (codes verified against OilPriceAPI docs)
    datasources.ts         DataProvider registry: id -> buildUrl
    priceFormat.ts          pure formatting helpers (no data fetching)
  lib/
    oilPriceApi.server.ts    real API client, server-only
  context/
    dataProvider.tsx         the live-data store + useLiveData hook
    watchlist.tsx            client-persisted tracked commodities (localStorage)
  components/                presentational UI (StatCard, TrendChart, Sparkline, ...)
  routes/
    _layout.tsx               app shell: sidebar/topbar/ticker, wraps everything
    _layout._index.tsx        Dashboard
    _layout.markets.tsx       Markets (browse + track)
    _layout.history.tsx       History (URL-param-driven loader)
    _layout.settings.tsx      Settings
    resources.series.tsx      JSON resource route: GET /resources/series
    resources.latest.tsx      JSON resource route: GET /resources/latest
  entry.client.tsx / entry.server.tsx / root.tsx
server.js                     Express host
```
