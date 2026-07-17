export interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Dashboard", icon: "◆", end: true },
  { to: "/markets", label: "Markets", icon: "◇" },
  { to: "/history", label: "History", icon: "◷" },
  { to: "/settings", label: "Settings", icon: "⚙" },
];
