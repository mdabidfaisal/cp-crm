import { useMemo, useState } from 'react';
import { useTransactionStore } from '../store/transactionStore';
import { useLoanStore } from '../store/loanStore';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, LOAN_INCOME_CATEGORIES, LOAN_EXPENSE_CATEGORIES } from '../utils/constants';

const LOAN_CATEGORIES = [...LOAN_INCOME_CATEGORIES, ...LOAN_EXPENSE_CATEGORIES];

export default function ProfitLossPage() {
  const transactions = useTransactionStore((s) => s.transactions);
  const loans = useLoanStore((s) => s.loans);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const report = useMemo(() => {
    const from = filterFrom || '1970-01-01';
    const to = filterTo || today;

    const filteredTxns = transactions.filter((t) => t.date >= from && t.date <= to);

    const incomeMap = {};
    const expenseMap = {};
    INCOME_CATEGORIES.forEach((c) => { incomeMap[c] = 0; });
    EXPENSE_CATEGORIES.forEach((c) => { expenseMap[c] = 0; });

    filteredTxns.forEach((t) => {
      if (LOAN_CATEGORIES.includes(t.category)) return;
      if (t.type === 'income') {
        incomeMap[t.category] = (incomeMap[t.category] || 0) + t.amount;
      } else if (t.type === 'expense') {
        expenseMap[t.category] = (expenseMap[t.category] || 0) + t.amount;
      }
    });

    const totalIncome = Object.values(incomeMap).reduce((s, v) => s + v, 0);
    const totalExpense = Object.values(expenseMap).reduce((s, v) => s + v, 0);

    return { incomeMap, expenseMap, totalIncome, totalExpense, netProfit: totalIncome - totalExpense };
  }, [transactions, filterFrom, filterTo, today]);

  const activeLoansGiven = loans.filter((l) => l.type === 'given' && l.status !== 'settled');
  const activeLoansTaken = loans.filter((l) => l.type === 'taken' && l.status !== 'settled');
  const loanRemaining = (l) => l.amount - (l.settlements || []).reduce((s, st) => s + st.amount, 0);
  const totalAssets = activeLoansGiven.reduce((s, l) => s + loanRemaining(l), 0);
  const totalLiabilities = activeLoansTaken.reduce((s, l) => s + loanRemaining(l), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Profit & Loss Report</h2>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="input text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="input text-sm" />
          </div>
          {(filterFrom || filterTo) && (
            <button onClick={() => { setFilterFrom(''); setFilterTo(''); }} className="btn btn-secondary text-sm">Reset</button>
          )}
          <p className="text-xs text-gray-400 ml-auto">
            {filterFrom || filterTo
              ? `${filterFrom || 'Start'} to ${filterTo || today}`
              : 'All time'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4 text-green-700">Income</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report.incomeMap).filter(([, v]) => v > 0).map(([cat, amt]) => (
                <tr key={cat} className="border-b last:border-0">
                  <td className="py-2">{cat}</td>
                  <td className="py-2 text-right text-green-600 font-medium">৳{amt.toLocaleString()}</td>
                </tr>
              ))}
              {Object.values(report.incomeMap).filter((v) => v > 0).length === 0 && (
                <tr><td colSpan={2} className="py-2 text-gray-400">No income.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold border-t">
                <td className="pt-2">Total Income</td>
                <td className="pt-2 text-right text-green-600">৳{report.totalIncome.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="card">
          <h3 className="font-semibold mb-4 text-red-700">Expense</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2">Category</th>
                <th className="pb-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(report.expenseMap).filter(([, v]) => v > 0).map(([cat, amt]) => (
                <tr key={cat} className="border-b last:border-0">
                  <td className="py-2">{cat}</td>
                  <td className="py-2 text-right text-red-600 font-medium">৳{amt.toLocaleString()}</td>
                </tr>
              ))}
              {Object.values(report.expenseMap).filter((v) => v > 0).length === 0 && (
                <tr><td colSpan={2} className="py-2 text-gray-400">No expenses.</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="font-semibold border-t">
                <td className="pt-2">Total Expense</td>
                <td className="pt-2 text-right text-red-600">৳{report.totalExpense.toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Summary</h3>
        <table className="w-full text-sm max-w-md">
          <tbody>
            <tr className="border-b">
              <td className="py-2">Total Income</td>
              <td className="py-2 text-right text-green-600 font-medium">৳{report.totalIncome.toLocaleString()}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Total Expense</td>
              <td className="py-2 text-right text-red-600 font-medium">-৳{report.totalExpense.toLocaleString()}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="font-semibold text-lg border-t">
              <td className="pt-3">Net Profit / Loss</td>
              <td className={`pt-3 text-right ${report.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {report.netProfit >= 0 ? '+' : ''}৳{report.netProfit.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-4">Balance Sheet — Loan Position</h3>
        <p className="text-xs text-gray-400 mb-3">Loan principal is not income or expense. It is shown here as assets (money owed to us) and liabilities (money we owe).</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Loan Assets (Given)</p>
            <p className="text-xl font-bold text-green-600">৳{totalAssets.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Loan Liabilities (Taken)</p>
            <p className="text-xl font-bold text-red-600">৳{totalLiabilities.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Loan Position</p>
            <p className={`text-xl font-bold ${totalAssets - totalLiabilities >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{(totalAssets - totalLiabilities).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
