import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';
import { useTransactions } from '../../hooks/useTransactions';
import Modal from '../Common/Modal';
import ProjectForm from './ProjectForm';
import PaymentTracker from './PaymentTracker';
import TeamAssignment from './TeamAssignment';

const STATUS_COLORS = {
  Planning: 'bg-gray-100 text-gray-700',
  Active: 'bg-green-100 text-green-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-blue-100 text-blue-700',
  Closed: 'bg-red-100 text-red-700',
};

export default function ProjectDetail({ projectId, onBack }) {
  const navigate = useNavigate();
  const { projects, getProject, updateProject, deleteProject } = useProjects();
  const { clients } = useClients();
  const { transactions } = useTransactions();
  const project = getProject(projectId);
  const [showEdit, setShowEdit] = useState(false);

  if (!project) {
    return (
      <div>
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 mb-4">&larr; Back to Projects</button>
        <p className="text-gray-500">Project not found.</p>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm(`Delete project "${project.name}"? This cannot be undone.`)) {
      await deleteProject(projectId);
      navigate('/projects');
    }
  };

  const client = clients.find((c) => c.id === project.clientId);
  const totalPaid = (project.payments || []).reduce((s, p) => s + p.amount, 0);
  const projectTransactions = transactions.filter((t) => t.projectId === projectId);
  const incomeFromProject = projectTransactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  const handleStatusChange = async (e) => {
    await updateProject(projectId, { status: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700">&larr; Back to Projects</button>
        <div className="flex gap-2">
          <button onClick={() => setShowEdit(true)} className="btn btn-secondary text-sm">Edit</button>
          <button onClick={handleDelete} className="btn btn-danger text-sm">Delete</button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-sm text-gray-500">{project.type}</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={project.status} onChange={handleStatusChange} className="input text-sm py-1">
            {['Planning', 'Active', 'On Hold', 'Completed', 'Closed'].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status] || ''}`}>{project.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Budget</p>
          <p className="text-xl font-bold">{project.budget ? `৳${project.budget.toLocaleString()}` : '—'}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-xl font-bold text-green-600">৳{totalPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Balance</p>
          <p className={`text-xl font-bold ${(project.budget || 0) - totalPaid > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            ৳{((project.budget || 0) - totalPaid).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Payment Mode</p>
          <p className="text-xl font-bold">{project.paymentMode || '—'}</p>
        </div>
      </div>

      {client && (
        <div className="card">
          <h3 className="font-semibold mb-2">Client</h3>
          <p className="font-medium">{client.name}</p>
          {client.email && <p className="text-sm text-gray-500">{client.email}</p>}
          {client.phone && <p className="text-sm text-gray-500">{client.phone}</p>}
          {client.company && <p className="text-sm text-gray-500">{client.company}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {project.brief && (
            <div className="card">
              <h4 className="font-semibold text-sm mb-1">Brief</h4>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.brief}</p>
            </div>
          )}

          <TeamAssignment projectId={projectId} />

          {project.deadline && (
            <div className="card">
              <h4 className="font-semibold text-sm mb-1">Deadline</h4>
              <p className="text-sm text-gray-600">{new Date(project.deadline).toLocaleDateString()}</p>
            </div>
          )}

          {project.createdAt && (
            <div className="card">
              <h4 className="font-semibold text-sm mb-1">Created</h4>
              <p className="text-sm text-gray-600">{new Date(project.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <PaymentTracker projectId={projectId} />

          {projectTransactions.length > 0 && (
            <div className="card">
              <h4 className="font-semibold text-sm mb-2">Related Transactions</h4>
              <div className="space-y-1">
                {projectTransactions.map((t) => (
                  <div key={t.id} className="flex justify-between text-sm p-1">
                    <span className="text-gray-500">{new Date(t.date).toLocaleDateString()} — {t.category}</span>
                    <span className={t.type === 'income' ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {t.type === 'income' ? '+' : '-'}৳{t.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
                <span>Total Income from Project</span>
                <span className="text-green-600">৳{incomeFromProject.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Project">
        <ProjectForm project={project} onClose={() => setShowEdit(false)} />
      </Modal>
    </div>
  );
}