import { Outlet } from "react-router";
import type { Route } from "./+types/_layout";
import { Sidebar } from "../components/layout/Sidebar";
import { BottomNav } from "../components/layout/BottomNav";
import { TopBar } from "../components/layout/TopBar";
import { TickerTape } from "../components/layout/TickerTape";
import { WatchlistProvider, useWatchlist } from "../context/watchlist";
import { CATALOG, buildColorMap } from "../data/catalog";

export async function loader({}: Route.LoaderArgs) {
  const latestByCode: Record<string, { time: string; price: number }> = {};
  for (const c of CATALOG) {
    latestByCode[c.code] = { time: new Date().toISOString(), price: 0 };
  }
  return { latestByCode, updatedAt: new Date().toISOString() };
}

export default function LayoutRoute({ loaderData }: Route.ComponentProps) {
  return (
    <WatchlistProvider>
      <Shell latestByCode={loaderData.latestByCode} updatedAt={loaderData.updatedAt} />
    </WatchlistProvider>
  );
}

function Shell({
  latestByCode,
  updatedAt,
}: {
  latestByCode: Record<string, { time: string; price: number }>;
  updatedAt: string;
}) {
  const { codes } = useWatchlist();
  const colors = buildColorMap(codes);

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <TopBar lastUpdated={updatedAt} />
        <TickerTape codes={codes} latest={latestByCode} colors={colors} />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
