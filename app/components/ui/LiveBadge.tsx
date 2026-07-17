import { useEffect, useState } from 'react';
import { formatRelativeTime } from '../../data/utils';

interface LiveBadgeProps {
  live: boolean;
  lastUpdated: string | null;
}

export function LiveBadge({ live, lastUpdated }: LiveBadgeProps) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: live ? '#5fa87c' : '#5a5a5f',
        }}
        className={live ? 'pulse-dot' : undefined}
      />
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: '#8b8b90',
        }}
      >
        {live ? 'LIVE' : 'PAUSED'} · {formatRelativeTime(lastUpdated)}
      </span>
    </span>
  );
}
