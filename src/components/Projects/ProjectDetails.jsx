import { useProjects } from '../../hooks/useProjects';

export default function ProjectDetails({ projectId }) {
  const { getProject } = useProjects();
  const project = getProject(projectId);

  if (!project) {
    return <p className="text-gray-500">Project not found.</p>;
  }

  const totalPaid = (project.payments || []).reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Budget</p>
          <p className="text-xl font-bold">${(project.budget || 0).toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Balance</p>
          <p className={`text-xl font-bold ${(project.budget || 0) - totalPaid > 0 ? 'text-red-600' : 'text-gray-600'}`}>
            ${((project.budget || 0) - totalPaid).toLocaleString()}
          </p>
        </div>
      </div>

      {project.brief && (
        <div className="card">
          <h4 className="font-semibold text-sm mb-1">Brief</h4>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{project.brief}</p>
        </div>
      )}

      {project.team?.length > 0 && (
        <div className="card">
          <h4 className="font-semibold text-sm mb-2">Team</h4>
          <div className="flex flex-wrap gap-2">
            {project.team.map((m) => (
              <span key={m} className="bg-gray-100 text-sm px-3 py-1 rounded-full">{m}</span>
            ))}
          </div>
        </div>
      )}

      {project.deadline && (
        <p className="text-sm text-gray-500">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
      )}
    </div>
  );
}
