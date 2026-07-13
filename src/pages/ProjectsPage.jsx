import { useState } from 'react';
import Modal from '../components/Common/Modal';
import ProjectsList from '../components/Projects/ProjectsList';
import ProjectForm from '../components/Projects/ProjectForm';

export default function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);

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
