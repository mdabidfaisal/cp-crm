import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/projects', label: 'Projects', icon: '◷' },
  { to: '/clients', label: 'Clients', icon: '◉' },
  { to: '/transactions', label: 'Transactions', icon: '₿' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  return (
    <nav className="w-56 bg-gray-900 text-white p-5 flex flex-col shrink-0">
      <h1 className="text-lg font-bold mb-8 tracking-wide">Code Prophet CRM</h1>
      <ul className="space-y-1 flex-1">
        {links.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
