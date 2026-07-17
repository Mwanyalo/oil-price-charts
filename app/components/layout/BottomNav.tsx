import { NavLink } from 'react-router';
import { NAV_ITEMS } from './navConfig';

export function BottomNav() {
  return (
    <nav aria-label='Primary' className='bottom-nav'>
      {NAV_ITEMS.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `bottom-nav-link${isActive ? ' active' : ''}`
          }
        >
          <span aria-hidden style={{ fontSize: '1.1rem' }}>
            {icon}
          </span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
