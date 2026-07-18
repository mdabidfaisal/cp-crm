import { Link } from 'react-router-dom';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h2>Reports</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/reports/profit-loss" className="card hover:shadow-md transition block no-underline">
          <h3 className="font-semibold text-lg mb-1">Profit & Loss</h3>
          <p className="text-sm text-gray-500">Income, expense, and loan position by category with date filter.</p>
        </Link>
        <Link to="/reports/client-wise" className="card hover:shadow-md transition block no-underline">
          <h3 className="font-semibold text-lg mb-1">Client-Wise Payments</h3>
          <p className="text-sm text-gray-500">Payment breakdown per client with date filter.</p>
        </Link>
      </div>
    </div>
  );
}