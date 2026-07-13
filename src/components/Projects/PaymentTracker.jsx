import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';

export default function PaymentTracker({ projectId }) {
  const { getProject, updateProject } = useProjects();
  const project = getProject(projectId);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!project) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;
    const payments = [...(project.payments || []), { id: Date.now().toString(), amount: val, note, date: new Date().toISOString() }];
    await updateProject(projectId, { payments });
    setAmount('');
    setNote('');
  };

  const payments = project.payments || [];
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Payments &middot; {project.paymentMode}</h3>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input type="number" step="0.01" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="input flex-1" required />
        <input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} className="input flex-1" />
        <button type="submit" className="btn btn-primary">Record</button>
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
              <th className="pb-2">Date</th>
              <th className="pb-2">Note</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
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
