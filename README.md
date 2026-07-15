# Oil Prices Dashboard

A small client-side dashboard showing oil price data using the OilPriceAPI. Built with
React + TypeScript and Vite. The app runs entirely in the browser and requires an API key
to fetch live data; without a key the app shows a setup screen.

## Quick Start

Requirements:
- Node.js 18+ (or compatible)
- npm (or yarn/pnpm)

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the project root with these values:

```
VITE_OILPRICE_API_KEY=your_api_key_here
VITE_BASE_API=https://api.oilpriceapi.com
```

Get a free API key at https://www.oilpriceapi.com/ (or use your own provider).

3. Start the dev server

```bash
npm run dev
```

Open http://localhost:5173 in a browser.

## Useful Scripts

- `npm run dev` — start development server (Vite)
- `npm run build` — typecheck and build for production
- `npm run preview` — preview the production build
- `npm run typecheck` — run TypeScript check only

## Environment Variables

- `VITE_OILPRICE_API_KEY` — your OilPriceAPI key
- `VITE_BASE_API` — base URL for the API (defaults to OilPriceAPI)

After changing `.env` restart the dev server so Vite picks up the new values.

## Project Layout (high level)

- `src/` — application source
- `src/api/oilApi.ts` — API client
- `src/components/` — UI components
- `src/pages/` — route pages (Dashboard, History, Markets, Settings)
- `src/providers/DataProvider.tsx` — data provider and context

See the source files for more detail.

## Troubleshooting

- Empty or setup screen — check `.env` and that `VITE_OILPRICE_API_KEY` is set.
- Type errors — run `npm run typecheck` to see TypeScript issues.

## Contributing

Pull requests welcome. Please open an issue first if you plan to make larger changes.

