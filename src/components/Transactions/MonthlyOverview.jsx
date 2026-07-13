import { useMemo } from 'react';
import { useTransactions } from '../../hooks/useTransactions';

export default function MonthlyOverview() {
  const { transactions } = useTransactions();

  const monthly = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const month = t.date.slice(0, 7);
      if (!map[month]) map[month] = { month, income: 0, expense: 0, count: 0 };
      map[month][t.type] += t.amount;
      map[month].count++;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).reverse();
  }, [transactions]);

  if (monthly.length === 0) return <p className="text-sm text-gray-400">No data yet.</p>;

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Monthly Summary</h3>
      <div className="space-y-2">
        {monthly.map((m) => (
          <div key={m.month} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50">
            <span className="font-medium">{m.month}</span>
            <div className="flex gap-4">
              <span className="text-green-600">+${m.income.toLocaleString()}</span>
              <span className="text-red-600">-${m.expense.toLocaleString()}</span>
              <span className={m.income - m.expense >= 0 ? 'text-gray-900' : 'text-red-600'}>
                ${(m.income - m.expense).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
