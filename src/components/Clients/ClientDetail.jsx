import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import { useTransactions } from '../../hooks/useTransactions';
import Modal from '../Common/Modal';
import ClientForm from './ClientForm';

export default function ClientDetail({ clientId, onBack }) {
  const navigate = useNavigate();
  const { clients, deleteClient } = useClients();
  const { projects } = useProjects();
  const { transactions } = useTransactions();
  const client = clients.find((c) => c.id === clientId);
  const [showEdit, setShowEdit] = useState(false);

  if (!client) {
    return (
      <div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4">&larr; Back to Clients</button>
        <p className="text-gray-500">Client not found.</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm(`Delete client "${client.name}"? This cannot be undone.`)) {
      await deleteClient(clientId);
      navigate('/clients');
    }
  };

  const clientProjects = projects.filter((p) => p.clientId === clientId);
  const clientProjectIds = clientProjects.map((p) => p.id);
  const totalPaid = clientProjects.reduce((s, p) => s + (p.payments || []).reduce((a, pay) => a + pay.amount, 0), 0);
  const totalBudget = clientProjects.reduce((s, p) => s + (p.budget || 0), 0);

  const clientTransactions = transactions.filter((t) => t.projectId && clientProjectIds.includes(t.projectId));
  const clientIncome = clientTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const clientExpense = clientTransactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Clients</button>
        <div className="flex gap-2">
          <button onClick={() => setShowEdit(true)} className="btn btn-secondary text-sm">Edit</button>
          <button onClick={handleDelete} className="btn btn-danger text-sm">Delete</button>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold">{client.name}</h2>
        <p className="text-sm text-gray-500">{client.email} {client.phone && `| ${client.phone}`}</p>
        {client.company && <p className="text-sm text-gray-500">{client.company}</p>}
        {client.address && <p className="text-sm text-gray-500">{client.address}</p>}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Projects</p>
          <p className="text-xl font-bold">{clientProjects.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-xl font-bold">{clientProjects.length > 0 ? `৳${totalBudget.toLocaleString()}` : '—'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-xl font-bold text-green-600">৳{totalPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className={`text-xl font-bold ${totalBudget - totalPaid > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            ৳{(totalBudget - totalPaid).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-3">Projects</h3>
          {clientProjects.length === 0 ? (
            <p className="text-sm text-gray-400">No projects for this client.</p>
          ) : (
            <div className="space-y-2">
              {clientProjects.map((p) => {
                const projectPaid = (p.payments || []).reduce((s, pay) => s + pay.amount, 0);
                return (
                  <div key={p.id} className="flex justify-between items-center text-sm p-2 rounded hover:bg-gray-50">
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-gray-400 ml-2">{p.status}</span>
                    </div>
                    <span className="text-green-600 font-medium">৳{projectPaid.toLocaleString()} / ৳{(p.budget || 0).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="font-semibold mb-3">Payment Report</h3>
          {clientProjects.length === 0 ? (
            <p className="text-sm text-gray-400">No payment data available.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2">Project</th>
                  <th className="pb-2 text-right">Payments</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {clientProjects.map((p) => {
                  const payments = p.payments || [];
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{p.name}</td>
                      <td className="py-2 text-right text-gray-500">{payments.length}</td>
                      <td className="py-2 text-right text-green-600 font-medium">
                        ৳{payments.reduce((s, pay) => s + pay.amount, 0).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-semibold border-t">
                  <td className="pt-2">Total</td>
                  <td className="pt-2 text-right">{clientProjects.reduce((s, p) => s + (p.payments || []).length, 0)}</td>
                  <td className="pt-2 text-right text-green-600">৳{totalPaid.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-3">Financial Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Income from Projects</p>
            <p className="text-lg font-bold text-green-600">৳{clientIncome.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Expenses on Projects</p>
            <p className="text-lg font-bold text-red-600">৳{clientExpense.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Profit / Loss</p>
            <p className={`text-lg font-bold ${clientIncome - clientExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ৳{(clientIncome - clientExpense).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Client">
        {client && <ClientForm client={client} onClose={() => setShowEdit(false)} />}
      </Modal>
    </div>
  );
}