import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';

export default function TeamAssignment({ projectId }) {
  const { getProject, updateProject } = useProjects();
  const project = getProject(projectId);
  const [input, setInput] = useState('');

  if (!project) return null;

  const addMember = async () => {
    const name = input.trim();
    if (!name) return;
    await updateProject(projectId, { team: [...(project.team || []), name] });
    setInput('');
  };

  const removeMember = async (name) => {
    await updateProject(projectId, { team: (project.team || []).filter((m) => m !== name) });
  };

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">Team Members</h3>

      <div className="flex gap-2 mb-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add member" className="input flex-1" />
        <button onClick={addMember} className="btn btn-primary">Add</button>
      </div>

      {(!project.team || project.team.length === 0) ? (
        <p className="text-sm text-gray-400">No team members assigned.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {project.team.map((m) => (
            <span key={m} className="inline-flex items-center gap-1 bg-gray-100 text-sm px-3 py-1 rounded-full">
              {m}
              <button onClick={() => removeMember(m)} className="text-gray-400 hover:text-red-500 text-xs ml-1">&times;</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
