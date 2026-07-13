import { useProjectStore } from '../store/projectStore';

export function useProjects() {
  const projects = useProjectStore((s) => s.projects);
  const isLoading = useProjectStore((s) => s.isLoading);
  const saveProject = useProjectStore((s) => s.saveProject);
  const updateProject = useProjectStore((s) => s.updateProject);
  const deleteProject = useProjectStore((s) => s.deleteProject);

  const getProject = (id) => projects.find((p) => p.id === id);

  return { projects, isLoading, getProject, saveProject, updateProject, deleteProject };
}
