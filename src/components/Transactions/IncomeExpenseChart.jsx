import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { useTransactions } from '../../hooks/useTransactions';

export default function IncomeExpenseChart() {
  const { transactions } = useTransactions();

  const data = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      const month = t.date.slice(0, 7);
      if (!map[month]) map[month] = { month, income: 0, expense: 0 };
      map[month][t.type] += t.amount;
    });
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
  }, [transactions]);

  if (data.length === 0) return null;

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Income vs Expense</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" fill="#ef4444" name="Expense" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
