import { useState } from 'react';
import Modal from '../components/Common/Modal';
import ClientsList from '../components/Clients/ClientsList';
import ClientForm from '../components/Clients/ClientForm';

export default function ClientsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Clients</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">+ Add Client</button>
      </div>
      <ClientsList />
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Add Client">
        <ClientForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  );
}
