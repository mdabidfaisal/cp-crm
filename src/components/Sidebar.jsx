import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/projects', label: 'Projects', icon: '◷' },
  { to: '/clients', label: 'Clients', icon: '◉' },
  { to: '/transactions', label: 'Transactions', icon: '₿' },
  { to: '/cashbook', label: 'Cashbook', icon: '📒' },
  { to: '/loans', label: 'Loan Book', icon: '💰' },
  { to: '/invoices', label: 'Invoices', icon: '📄' },
];

const reportLinks = [
  { to: '/reports/profit-loss', label: 'Profit & Loss', icon: '📈' },
  { to: '/reports/client-wise', label: 'Client Payments', icon: '📋' },
];

const bottomLinks = [
  { to: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  return (
    <nav className="w-56 bg-gray-900 text-white p-5 flex flex-col shrink-0">
      <div className="flex items-center gap-3 mb-8">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded" />
        <h1 className="text-lg font-bold tracking-wide">Code Prophet CRM</h1>
      </div>
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
        <li className="pt-3 pb-1">
          <p className="text-xs text-gray-500 uppercase tracking-wider px-3">Reports</p>
        </li>
        {reportLinks.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
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
      <ul className="space-y-1 pt-4 border-t border-gray-800">
        {bottomLinks.map(({ to, label, icon }) => (
          <li key={to}>
            <NavLink
              to={to}
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
