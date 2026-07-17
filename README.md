# rr-vite-express

A React Router + Vite + Express starter app for a commodity price dashboard. The app includes a server-rendered shell, live-updating watchlist dashboard, market catalog, history charts, and theme settings.

## Features

- React Router v8 routes with server-side rendering support
- Vite-powered development and build workflow
- Express server for production and dev middleware mode
- Watchlist stored in `localStorage`
- Live price simulation with trend charts and sparkline mini-charts
- Category filtering, search, and settings

## Quick Start

Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with these values:

```
VITE_OILPRICE_API_KEY=your_api_key_here
VITE_BASE_API=https://api.oilpriceapi.com
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

## Scripts

- `npm run dev` - start the React Router/Vite dev server
- `npm run build` - build the production client/server output
- `npm run start` - run the Express server in production mode
- `npm run typecheck` - generate route types and run TypeScript type checking

## Project Structure

- `app/` - application source code
- `app/routes/` - route components and loaders
- `app/components/` - shared UI components
- `app/context/` - React context providers
- `app/data/` - catalog and mock price generation
- `server.js` - Express server entrypoint
- `vite.config.ts` - Vite configuration
- `tsconfig.json` - TypeScript configuration

