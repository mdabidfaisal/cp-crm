import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';
import Loading from '../Common/Loading';
import Modal from '../Common/Modal';
import ClientForm from './ClientForm';

export default function ClientsList() {
  const { clients, isLoading, deleteClient } = useClients();
  const { projects } = useProjects();
  const [editingClient, setEditingClient] = useState(null);

  const handleDelete = async (id, name) => {
    if (confirm(`Delete client "${name}"? This cannot be undone.`)) {
      await deleteClient(id);
    }
  };

  if (isLoading) return <Loading text="Loading clients..." />;

  if (clients.length === 0) {
    return <p className="text-gray-500">No clients yet.</p>;
  }

  return (
    <>
      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3 text-center">Projects</th>
              <th className="p-3 text-right">Total Paid</th>
              <th className="p-3 text-right">Outstanding</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => {
              const clientProjects = projects.filter((p) => p.clientId === c.id);
              const totalPaid = clientProjects.reduce((s, p) => s + (p.payments || []).reduce((a, pay) => a + pay.amount, 0), 0);
              const totalBudget = clientProjects.reduce((s, p) => s + (p.budget || 0), 0);
              return (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-3 font-medium">
                    <Link to={`/clients/${c.id}`} className="text-gray-900 hover:text-primary-600 no-underline">{c.name}</Link>
                  </td>
                  <td className="p-3 text-gray-500">{c.email || '-'}</td>
                  <td className="p-3 text-gray-500">{c.phone || '-'}</td>
                  <td className="p-3 text-center">{clientProjects.length}</td>
                  <td className="p-3 text-right text-green-600 font-medium">৳{totalPaid.toLocaleString()}</td>
                  <td className="p-3 text-right font-medium">৳{(totalBudget - totalPaid).toLocaleString()}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => setEditingClient(c)} className="text-blue-500 hover:text-blue-700 text-sm mr-2" title="Edit">Edit</button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="text-red-500 hover:text-red-700 text-sm" title="Delete">Del</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Modal open={!!editingClient} onClose={() => setEditingClient(null)} title="Edit Client">
        {editingClient && <ClientForm client={editingClient} onClose={() => setEditingClient(null)} />}
      </Modal>
    </>
  );
}
