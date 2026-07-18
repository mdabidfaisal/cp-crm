import { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import Loading from '../Common/Loading';
import Modal from '../Common/Modal';
import TransactionForm from './TransactionForm';

export default function TransactionsList() {
  const { transactions, isLoading, deleteTransaction } = useTransactions();
  const [filter, setFilter] = useState('all');
  const [editingTxn, setEditingTxn] = useState(null);

  const handleDelete = async (id) => {
    if (confirm('Delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  if (isLoading) return <Loading text="Loading transactions..." />;

  const filtered = transactions.filter((t) => filter === 'all' || t.type === filter);

  if (filtered.length === 0) {
    return <p className="text-gray-500">No transactions yet.</p>;
  }

  return (
    <>
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
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                <td className="p-3">{t.category}</td>
                <td className="p-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {t.type}
                  </span>
                </td>
                <td className="p-3 text-right font-medium">৳{t.amount.toLocaleString()}</td>
                <td className="p-3 text-gray-500">{t.note || '-'}</td>
                <td className="p-3 text-center">
                  <button onClick={() => setEditingTxn(t)} className="text-blue-500 hover:text-blue-700 text-sm mr-2" title="Edit">Edit</button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-500 hover:text-red-700 text-sm" title="Delete">Del</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={!!editingTxn} onClose={() => setEditingTxn(null)} title="Edit Transaction">
        {editingTxn && <TransactionForm transaction={editingTxn} onClose={() => setEditingTxn(null)} />}
      </Modal>
    </>
  );
}
