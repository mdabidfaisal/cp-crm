import { Link } from 'react-router-dom';

export default function RecentProjects({ projects = [] }) {
  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Recent Projects</h3>
        <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 underline">View all</Link>
      </div>
      {projects.length === 0 ? (
        <p className="text-sm text-gray-400">No projects yet.</p>
      ) : (
        <ul className="space-y-1">
          {projects.slice(0, 5).map((p) => (
            <li key={p.id}>
              <Link to={`/projects/${p.id}`} className="flex justify-between text-sm hover:bg-gray-50 p-2 rounded">
                <span>{p.name}</span>
                <span className="text-gray-500">{p.status}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
