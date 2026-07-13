import { Link } from 'react-router-dom';

export default function FinancialOverview({ transactions = [] }) {
  const recent = transactions.slice(0, 5);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Recent Transactions</h3>
        <Link to="/transactions" className="text-sm text-primary-600 hover:text-primary-700 underline">View all</Link>
      </div>
      {recent.length === 0 ? (
        <p className="text-sm text-gray-400">No transactions yet.</p>
      ) : (
        <ul className="space-y-1">
          {recent.map((t) => (
            <li key={t.id} className="flex justify-between text-sm p-2">
              <span>{t.category}</span>
              <span className={t.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
