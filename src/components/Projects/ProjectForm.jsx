import { useState } from 'react';
import { useProjects } from '../../hooks/useProjects';
import { useClients } from '../../hooks/useClients';

const PROJECT_TYPES = ['Web Dev', 'Mobile', 'Design', 'Marketing', 'Consulting', 'Other'];
const PAYMENT_MODES = ['Full', 'Installments', 'Retainer'];
const STATUSES = ['Planning', 'Active', 'On Hold', 'Completed', 'Closed'];

export default function ProjectForm({ onClose }) {
  const { saveProject } = useProjects();
  const { clients } = useClients();
  const [form, setForm] = useState({
    name: '', clientId: '', type: '', brief: '', budget: '',
    paymentMode: 'Full', deadline: '', status: 'Planning', team: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveProject({
        id: crypto.randomUUID(),
        ...form,
        budget: parseFloat(form.budget) || 0,
        team: form.team.split(',').map((t) => t.trim()).filter(Boolean),
        payments: [],
        createdAt: new Date().toISOString(),
      });
      onClose();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="input-label">Project Name</label>
        <input name="name" placeholder="Project name" value={form.name} onChange={handleChange} required className="input w-full" />
      </div>

      <div className="form-group">
        <label className="input-label">Client</label>
        <select name="clientId" value={form.clientId} onChange={handleChange} className="input w-full">
          <option value="">Select client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="input-label">Project Type</label>
        <select name="type" value={form.type} onChange={handleChange} required className="input w-full">
          <option value="">Project type</option>
          {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>

      <div className="form-group">
        <label className="input-label">Brief</label>
        <textarea name="brief" placeholder="Brief" value={form.brief} onChange={handleChange} rows={3} className="input w-full" />
      </div>

      <div className="flex gap-3">
        <div className="form-group flex-1">
          <label className="input-label">Budget</label>
          <input name="budget" type="number" step="0.01" placeholder="Budget" value={form.budget} onChange={handleChange} className="input w-full" />
        </div>
        <div className="form-group w-40">
          <label className="input-label">Payment Mode</label>
          <select name="paymentMode" value={form.paymentMode} onChange={handleChange} className="input w-full">
            {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="form-group flex-1">
          <label className="input-label">Deadline</label>
          <input name="deadline" type="date" value={form.deadline} onChange={handleChange} className="input w-full" />
        </div>
        <div className="form-group w-40">
          <label className="input-label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="input w-full">
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="input-label">Team Members (comma-separated)</label>
        <input name="team" placeholder="Team members (comma-separated)" value={form.team} onChange={handleChange} className="input w-full" />
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">Create Project</button>
      </div>
    </form>
  );
}
