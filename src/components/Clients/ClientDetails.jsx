import { useClients } from '../../hooks/useClients';
import { useProjects } from '../../hooks/useProjects';

export default function ClientDetails({ clientId }) {
  const { clients } = useClients();
  const { projects } = useProjects();
  const client = clients.find((c) => c.id === clientId);

  if (!client) return <p className="text-gray-500">Client not found.</p>;

  const clientProjects = projects.filter((p) => p.clientId === clientId);
  const totalPaid = clientProjects.reduce((s, p) => s + (p.payments || []).reduce((a, pay) => a + pay.amount, 0), 0);
  const totalBudget = clientProjects.reduce((s, p) => s + (p.budget || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">{client.name}</h3>
        <p className="text-sm text-gray-500">{client.email} {client.phone && `| ${client.phone}`}</p>
        {client.company && <p className="text-sm text-gray-500">{client.company}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Projects</p>
          <p className="text-xl font-bold">{clientProjects.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Paid</p>
          <p className="text-xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-xl font-bold text-red-600">${(totalBudget - totalPaid).toLocaleString()}</p>
        </div>
      </div>

      {clientProjects.length > 0 && (
        <div className="card">
          <h4 className="font-semibold text-sm mb-2">Projects</h4>
          <ul className="space-y-1">
            {clientProjects.map((p) => (
              <li key={p.id} className="text-sm flex justify-between">
                <span>{p.name}</span>
                <span className="text-gray-500">{p.status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
