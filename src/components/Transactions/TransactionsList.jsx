import { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import Loading from '../Common/Loading';

export default function TransactionsList() {
  const { transactions, isLoading } = useTransactions();
  const [filter, setFilter] = useState('all');

  if (isLoading) return <Loading text="Loading transactions..." />;

  const filtered = transactions.filter((t) => filter === 'all' || t.type === filter);

  if (filtered.length === 0) {
    return <p className="text-gray-500">No transactions yet.</p>;
  }

  return (
    <div className="card overflow-hidden p-0">
      <div className="p-3 border-b flex gap-2 bg-gray-50">
        {['all', 'income', 'expense'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1 text-sm rounded-full border ${filter === f ? 'bg-gray-900 text-white' : 'bg-white'}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-gray-500">
            <th className="p-3">Date</th>
            <th className="p-3">Category</th>
            <th className="p-3">Type</th>
            <th className="p-3 text-right">Amount</th>
            <th className="p-3">Note</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((t) => (
            <tr key={t.id} className="border-b last:border-0">
              <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
              <td className="p-3">{t.category}</td>
              <td className="p-3">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {t.type}
                </span>
              </td>
              <td className="p-3 text-right font-medium">${t.amount.toLocaleString()}</td>
              <td className="p-3 text-gray-500">{t.note || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
