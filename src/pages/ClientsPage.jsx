import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from '../components/Common/Modal';
import ClientsList from '../components/Clients/ClientsList';
import ClientForm from '../components/Clients/ClientForm';
import ClientDetail from '../components/Clients/ClientDetail';

export default function ClientsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  if (id) {
    return <ClientDetail clientId={id} onBack={() => navigate('/clients')} />;
  }

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
