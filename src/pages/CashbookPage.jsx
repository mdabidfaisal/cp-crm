import { useMemo, useState } from 'react';
import { useTransactionStore } from '../store/transactionStore';

const OPENING_BALANCE = 34907.00;

export default function CashbookPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const ledger = useMemo(() => {
    const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
    let running = OPENING_BALANCE;
    const today = new Date().toISOString().slice(0, 10);

    const from = filterFrom || '';
    const to = filterTo || today;

    const rows = [];
    for (const t of sorted) {
      if (t.date < from) {
        running += t.type === 'income' ? t.amount : -t.amount;
        continue;
      }
      if (t.date > to) break;
      const isIncome = t.type === 'income';
      running += isIncome ? t.amount : -t.amount;
      rows.push({
        id: t.id,
        date: t.date,
        description: `${t.category}${t.note ? ` — ${t.note}` : ''}`,
        income: isIncome ? t.amount : 0,
        expense: isIncome ? 0 : t.amount,
        balance: running,
      });
    }
    return { rows, openingBeforeFilter: OPENING_BALANCE, currentBalance: running };
  }, [transactions, filterFrom, filterTo]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Cashbook</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Opening Balance</p>
          <p className="text-xl font-bold">৳{OPENING_BALANCE.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Income</p>
          <p className="text-xl font-bold text-green-600">
            ৳{ledger.rows.reduce((s, r) => s + r.income, 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Expense</p>
          <p className="text-xl font-bold text-red-600">
            ৳{ledger.rows.reduce((s, r) => s + r.expense, 0).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Current Balance</p>
          <p className={`text-xl font-bold ${ledger.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ৳{ledger.currentBalance.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="input text-sm" />
          </div>
          {(filterFrom || filterTo) && (
            <div className="flex items-end">
              <button onClick={() => { setFilterFrom(''); setFilterTo(''); }} className="btn btn-secondary text-sm">Reset</button>
            </div>
          )}
        </div>

        {ledger.rows.length === 0 ? (
          <p className="text-sm text-gray-400">No transactions in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Description</th>
                  <th className="pb-3 text-right">Income</th>
                  <th className="pb-3 text-right">Expense</th>
                  <th className="pb-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-gray-500 border-b">
                  <td className="py-2" colSpan={4}>Opening Balance</td>
                  <td className="py-2 text-right font-medium">৳{OPENING_BALANCE.toLocaleString()}</td>
                </tr>
                {ledger.rows.map((r) => (
                  <tr key={r.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-2 text-gray-600">{r.description}</td>
                    <td className="py-2 text-right text-green-600 font-medium">
                      {r.income > 0 ? `৳${r.income.toLocaleString()}` : ''}
                    </td>
                    <td className="py-2 text-right text-red-600 font-medium">
                      {r.expense > 0 ? `৳${r.expense.toLocaleString()}` : ''}
                    </td>
                    <td className={`py-2 text-right font-medium ${r.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                      ৳{r.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold border-t">
                  <td className="pt-3" colSpan={2}>Closing Balance</td>
                  <td className="pt-3 text-right text-green-600">
                    ৳{ledger.rows.reduce((s, r) => s + r.income, 0).toLocaleString()}
                  </td>
                  <td className="pt-3 text-right text-red-600">
                    ৳{ledger.rows.reduce((s, r) => s + r.expense, 0).toLocaleString()}
                  </td>
                  <td className={`pt-3 text-right ${ledger.currentBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ৳{ledger.currentBalance.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
