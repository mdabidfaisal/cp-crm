import { useState } from 'react';
import { useClients } from '../../hooks/useClients';

export default function ClientForm({ onClose, client: initialClient }) {
  const { addClient, updateClient } = useClients();
  const isEdit = !!initialClient;
  const [form, setForm] = useState({
    name: initialClient?.name || '',
    email: initialClient?.email || '',
    phone: initialClient?.phone || '',
    company: initialClient?.company || '',
    address: initialClient?.address || '',
  });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      await updateClient(initialClient.id, form);
    } else {
      await addClient(form);
    }
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
      <div className="form-group">
        <label className="input-label">Address</label>
        <textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} className="input w-full" rows="2" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">{isEdit ? 'Update Client' : 'Add Client'}</button>
      </div>
    </form>
  );
}
