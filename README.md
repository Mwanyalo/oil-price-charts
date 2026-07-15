# Oil Prices Dashboard

A live Oil Prices dashboard built with React, TypeScript, Vite, Chakra UI v2, React
Router and Recharts. Without an
API key the app shows a setup screen instead of inventing numbers.

## Quick start

```bash
npm install
add .env
npm run dev
```

Get a free key at [oilpriceapi.com](https://www.oilpriceapi.com/) and set `VITE_OILPRICE_API_KEY` and `VITE_BASE_API` in `.env`. Restart the dev server
after changing it.

## Tech

Vite · React 18 · TypeScript · Chakra UI v2 · React Router v6 · Recharts · `fetch` (no axios) · no
backend — everything runs client-side against OilPriceAPI. `npm run typecheck` runs `tsc -b` on
its own if you want type errors without a full build.
