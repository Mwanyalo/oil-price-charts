import { LiveBadge } from '../ui/LiveBadge';
import { ThemeToggle } from '../ui/ThemeToggle';

interface TopBarProps {
  lastUpdated: string | null;
}

export function TopBar({ lastUpdated }: TopBarProps) {
  return (
    <header className='topbar'>
      <div className='brand mobile-only'>
        <span className='brand-mark' />
        <span className='brand-name'>Oil Prices</span>
      </div>
      <div className='desktop-only'>
        <LiveBadge live lastUpdated={lastUpdated} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className='mobile-only'>
          <LiveBadge live lastUpdated={lastUpdated} />
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
