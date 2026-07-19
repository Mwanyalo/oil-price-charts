import { useMemo, useState } from 'react';
import { CategoryTabs } from '../components/commodities/CategoryTabs';
import { CommodityCard } from '../components/commodities/CommodityCard';
import { useWatchlist } from '../context/watchlist';
import { useCatalog } from '../context/catalog';

export default function Markets() {
  const [category, setCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const { codes, isTracked, toggle, atLimit, maxSize } = useWatchlist();
  const { commodities, error, isLoading } = useCatalog();
  const categories = useMemo(
    () => Array.from(new Set(commodities.map((c) => c.category))).sort(),
    [commodities],
  );
  const filtered = useMemo(() => {
    let list = commodities;
    if (category) list = list.filter((c) => c.category === category);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [category, search, commodities]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem' }}>Markets</h1>
        <p className='muted' style={{ fontSize: '0.85rem', marginTop: 4 }}>
          A search catalog from OilPriceAPI. Track any instrument to
          add it to your dashboard or history.
        </p>
        {isLoading && (
          <p className='muted' style={{ fontSize: '0.8rem' }}>
            Loading live catalog...
          </p>
        )}
        {error && (
          <p className='muted' style={{ fontSize: '0.8rem' }}>
            Live catalog unavailable: {error}
          </p>
        )}
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
            {commodities.length} commodities available · tracking {codes.length}
            /{maxSize}
          </p>
          <input
            placeholder='Search commodities...'
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
                onToggle={() => toggle(commodity.code)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
