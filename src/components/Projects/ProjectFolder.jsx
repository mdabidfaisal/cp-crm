import { useProjects } from '../../hooks/useProjects';

const FOLDERS = [
  { name: 'Briefs', icon: '📄' },
  { name: 'Designs', icon: '🎨' },
  { name: 'Invoices', icon: '💰' },
  { name: 'Deliverables', icon: '📦' },
  { name: 'Communications', icon: '💬' },
];

export default function ProjectFolder({ projectId }) {
  const { getProject } = useProjects();
  const project = getProject(projectId);
  if (!project) return null;

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Project Folders</h3>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {FOLDERS.map((f) => (
          <button key={f.name} className="flex flex-col items-center gap-1 p-3 rounded-lg border hover:bg-gray-50 transition">
            <span className="text-2xl">{f.icon}</span>
            <span className="text-xs text-gray-600">{f.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
