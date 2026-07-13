import { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';

const CATEGORIES = ['Salary', 'Freelance', 'Client Payment', 'Refund', 'Software', 'Office', 'Marketing', 'Travel', 'Food', 'Utilities', 'Other'];

export default function TransactionForm({ onClose }) {
  const { addTransaction } = useTransactions();
  const [form, setForm] = useState({ date: '', category: '', type: 'expense', amount: '', note: '' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTransaction({ ...form, amount: parseFloat(form.amount) || 0 });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="input-label">Date</label>
        <input name="date" type="date" value={form.date} onChange={handleChange} required className="input w-full" />
      </div>

      <div className="form-group">
        <label className="input-label">Category</label>
        <select name="category" value={form.category} onChange={handleChange} required className="input w-full">
          <option value="">Category</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="input-label">Type</label>
        <div className="flex gap-3">
          {['income', 'expense'].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} />
              <span className="capitalize">{t}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="input-label">Amount</label>
        <input name="amount" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={handleChange} required className="input w-full" />
      </div>

      <div className="form-group">
        <label className="input-label">Note</label>
        <input name="note" placeholder="Note" value={form.note} onChange={handleChange} className="input w-full" />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">Add Transaction</button>
      </div>
    </form>
  );
}
