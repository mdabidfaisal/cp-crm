import { Link } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects';
import Loading from '../Common/Loading';

const STATUS_COLORS = {
  Planning: 'bg-gray-100 text-gray-700',
  Active: 'bg-green-100 text-green-700',
  'On Hold': 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-blue-100 text-blue-700',
  Closed: 'bg-red-100 text-red-700',
};

export default function ProjectsList() {
  const { projects, isLoading, deleteProject } = useProjects();

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Delete this project? This action cannot be undone.')) {
      await deleteProject(id);
    }
  };

  if (isLoading) return <Loading text="Loading projects..." />;

  if (projects.length === 0) {
    return <p className="text-gray-500">No projects yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((p) => {
        const totalPaid = (p.payments || []).reduce((s, pay) => s + pay.amount, 0);
        return (
          <div key={p.id} className="card hover:shadow-md transition relative group">
            <Link to={`/projects/${p.id}`} className="block">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">{p.type}</p>
              <div className="flex justify-between text-sm">
                <span>Budget: <strong>৳{(p.budget || 0).toLocaleString()}</strong></span>
                <span>Paid: <strong>৳{totalPaid.toLocaleString()}</strong></span>
              </div>
              {p.deadline && (
                <p className="text-xs text-gray-400 mt-2">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
              )}
            </Link>
            <button onClick={(e) => handleDelete(e, p.id)}
              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition text-lg leading-none p-1"
              title="Delete project">&times;</button>
          </div>
        );
      })}
    </div>
  );
}
