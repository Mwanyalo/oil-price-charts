import { NavLink } from 'react-router';
import { NAV_ITEMS } from './navConfig';

export function Sidebar() {
  return (
    <nav aria-label='Primary' className='sidebar'>
      <div className='brand'>
        <span className='brand-mark' />
        <span className='brand-name'>Oil Prices</span>
      </div>
      {NAV_ITEMS.map(({ to, label, icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `sidebar-link${isActive ? ' active' : ''}`
          }
        >
          <span aria-hidden>{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
