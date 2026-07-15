import { FiActivity, FiCompass, FiClock, FiSettings } from 'react-icons/fi';
import type { IconType } from 'react-icons';

export interface NavItem {
  to: string;
  label: string;
  icon: IconType;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: FiActivity, end: true },
  { to: '/markets', label: 'Markets', icon: FiCompass },
  { to: '/history', label: 'History', icon: FiClock },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];
