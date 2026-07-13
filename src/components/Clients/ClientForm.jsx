import { useState } from 'react';
import { useClients } from '../../hooks/useClients';

export default function ClientForm({ onClose }) {
  const { addClient } = useClients();
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addClient(form);
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="input-label">Name</label>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Email</label>
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Phone</label>
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Company</label>
        <input name="company" placeholder="Company" value={form.company} onChange={handleChange} className="input w-full" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">Add Client</button>
      </div>
    </form>
  );
}
