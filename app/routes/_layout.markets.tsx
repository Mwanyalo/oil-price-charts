import { useEffect, useMemo, useState } from 'react';
import type { Route } from './+types/_layout.markets';
import { CategoryTabs } from '../components/commodities/CategoryTabs';
import { CommodityCard } from '../components/commodities/CommodityCard';
import { useWatchlist } from '../context/watchlist';
import { CATALOG } from '../data/catalog';

export async function loader({}: Route.LoaderArgs) {
  const latestByCode: Record<string, number> = {};
  for (const c of CATALOG) {
    latestByCode[c.code] = 0;
  }
  return { latestByCode };
}

export default function Markets({ loaderData }: Route.ComponentProps) {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [latestByCode, setLatestByCode] = useState(loaderData.latestByCode);
  const { codes, isTracked, toggle, atLimit, maxSize } = useWatchlist();

  useEffect(() => {
    async function fetchPrices() {
      try {
        const apiKey = import.meta.env.VITE_COMMODITY_API_KEY;
        if (!apiKey) return;

        const prices: Record<string, number> = {};
        const promises = CATALOG.map((c) =>
          fetch(`/api/commodities/${c.code}?key=${encodeURIComponent(apiKey)}`)
            .then((res) => {
              if (res.ok) return res.json();
              throw new Error('Failed to fetch');
            })
            .then((data) => {
              prices[c.code] = data.price || 0;
            })
            .catch(() => {
              prices[c.code] = 0;
            }),
        );

        await Promise.all(promises);
        setLatestByCode(prices);
      } catch (err) {
        console.warn('Failed to fetch latest prices:', err);
      }
    }

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(CATALOG.map((c) => c.category))).sort(),
    [],
  );

  const filtered = useMemo(() => {
    let list = CATALOG;
    if (category) list = list.filter((c) => c.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [category, search]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem' }}>Markets</h1>
        <p className='muted' style={{ fontSize: '0.85rem', marginTop: 4 }}>
          Browse the catalog and track what you want to follow it will show up
          on the Dashboard.
        </p>
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'end',
            flexWrap: 'wrap',
            gap: 10,
            marginBottom: 12,
          }}
        >
          <p className='muted' style={{ fontSize: '0.8rem', margin: 0 }}>
            {CATALOG.length} commodities available · tracking {codes.length}/
            {maxSize}
          </p>
          <input
            placeholder='Search commodities…'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 220 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <CategoryTabs
            categories={categories}
            active={category}
            onChange={setCategory}
          />
        </div>

        {filtered.length === 0 && (
          <p className='muted' style={{ fontSize: '0.85rem' }}>
            No commodities match that search.
          </p>
        )}

        <div className='grid grid-3'>
          {filtered.map((commodity) => {
            const tracked = isTracked(commodity.code);
            const disabled = tracked ? codes.length <= 1 : atLimit;
            return (
              <CommodityCard
                key={commodity.code}
                commodity={commodity}
                tracked={tracked}
                disabled={disabled}
                disabledReason={
                  tracked
                    ? 'Keep at least one commodity tracked'
                    : `You're tracking ${maxSize}/${maxSize} — untrack one to add another`
                }
                latestPrice={loaderData.latestByCode[commodity.code]}
                onToggle={() => toggle(commodity.code)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
