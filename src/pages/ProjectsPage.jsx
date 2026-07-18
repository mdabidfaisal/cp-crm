import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Common/Modal';
import ProjectsList from '../components/Projects/ProjectsList';
import ProjectForm from '../components/Projects/ProjectForm';
import ProjectDetail from '../components/Projects/ProjectDetail';

export default function ProjectsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  if (id) {
    return <ProjectDetail projectId={id} onBack={() => navigate('/projects')} />;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Projects</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">+ New Project</button>
      </div>
      <ProjectsList />
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Project">
        <ProjectForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
