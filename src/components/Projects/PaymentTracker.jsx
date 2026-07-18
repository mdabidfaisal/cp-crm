import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useTransactionStore } from '../../store/transactionStore';

export default function PaymentTracker({ projectId }) {
  const { getProject, updateProject } = useProjects();
  const addTransaction = useTransactionStore((s) => s.addTransaction);
  const project = getProject(projectId);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  if (!project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    setSaving(true);

    const payments = project.payments || [];
    const paymentNo = payments.length + 1;
    const payment = { id: Date.now().toString(), paymentNo, amount: val, note, date: new Date().toISOString() };

    try {
      await updateProject(projectId, { payments: [...payments, payment] });

      await addTransaction({
        date: payment.date.slice(0, 10),
        type: 'income',
        category: 'Client Payment',
        amount: val,
        note: note || `Payment ${paymentNo} for ${project.name}`,
        projectId,
      });
    } catch (err) {
      console.error('Payment recording failed:', err);
    }

    setSaving(false);
    setAmount('');
    setNote('');
  };

  const payments = project.payments || [];
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Payments &middot; {project.paymentMode}</h3>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="input w-32" required />
        <input placeholder="Payment {n} — note" value={note} onChange={(e) => setNote(e.target.value)} className="input flex-1" />
        <button type="submit" disabled={saving} className="btn btn-primary">{saving ? 'Saving...' : 'Record'}</button>
      </form>

      <div className="flex gap-4 mb-3 text-sm">
        <span>Total paid: <strong>৳{totalPaid.toLocaleString()}</strong></span>
        <span>Budget: <strong>৳{(project.budget || 0).toLocaleString()}</strong></span>
      </div>

      {payments.length === 0 ? (
        <p className="text-sm text-gray-400">No payments recorded.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-500">
              <th className="pb-2">#</th>
              <th className="pb-2">Date</th>
              <th className="pb-2">Note</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2 font-medium text-gray-500">#{p.paymentNo || payments.indexOf(p) + 1}</td>
                <td className="py-2">{new Date(p.date).toLocaleDateString()}</td>
                <td className="py-2 text-gray-500">{p.note || '-'}</td>
                <td className="py-2 text-right font-medium">৳{p.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
