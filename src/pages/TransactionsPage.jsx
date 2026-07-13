import { useState } from 'react';
import Modal from '../components/Common/Modal';
import TransactionsList from '../components/Transactions/TransactionsList';
import TransactionForm from '../components/Transactions/TransactionForm';
import IncomeExpenseChart from '../components/Transactions/IncomeExpenseChart';
import MonthlyOverview from '../components/Transactions/MonthlyOverview';
import { useTransactionStore } from '../store/transactionStore';

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);

  const exportCSV = () => {
    const transactions = useTransactionStore.getState().transactions;
    const header = 'Date,Category,Type,Amount,Note\n';
    const rows = transactions.map((t) => `${t.date},${t.category},${t.type},${t.amount},"${t.note || ''}"`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2>Transactions</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn btn-secondary text-sm">Export CSV</button>
          <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Transaction</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeExpenseChart />
        <MonthlyOverview />
      </div>
      <TransactionsList />
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Transaction">
        <TransactionForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
