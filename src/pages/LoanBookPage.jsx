import { useState, useEffect } from 'react';
import { useLoanPersonStore } from '../store/loanPersonStore';
import { useLoanStore } from '../store/loanStore';
import Modal from '../components/Common/Modal';

function PersonForm({ onClose, person: initialPerson }) {
  const { addPerson, updatePerson } = useLoanPersonStore();
  const isEdit = !!initialPerson;
  const [form, setForm] = useState({
    name: initialPerson?.name || '',
    phone: initialPerson?.phone || '',
    address: initialPerson?.address || '',
    note: initialPerson?.note || '',
  });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
      await updatePerson(initialPerson.id, form);
    } else {
      await addPerson(form);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="input-label">Name</label>
        <input name="name" placeholder="Full name" value={form.name} onChange={handleChange} required className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Phone</label>
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Address</label>
        <input name="address" placeholder="Address" value={form.address} onChange={handleChange} className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Note</label>
        <input name="note" placeholder="Note" value={form.note} onChange={handleChange} className="input w-full" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">{isEdit ? 'Update Person' : 'Add Person'}</button>
      </div>
    </form>
  );
}

function LoanForm({ onClose, persons, loan: initialLoan }) {
  const { addLoan, updateLoan } = useLoanStore();
  const isEdit = !!initialLoan;
  const [form, setForm] = useState({
    personId: initialLoan?.personId || '',
    type: initialLoan?.type || 'given',
    amount: initialLoan?.amount || '',
    date: initialLoan?.date || new Date().toISOString().slice(0, 10),
    note: initialLoan?.note || '',
  });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const getPersonName = (pid) => persons.find((p) => p.id === pid)?.name || '';
  const selectedPersonName = getPersonName(form.personId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { ...form, personName: selectedPersonName, amount: parseFloat(form.amount) || 0 };
    if (isEdit) {
      await updateLoan(initialLoan.id, data);
    } else {
      await addLoan(data);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="input-label">Person</label>
        <select name="personId" value={form.personId} onChange={handleChange} required className="input w-full">
          <option value="">Select person</option>
          {persons.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="input-label">Type</label>
        <select name="type" value={form.type} onChange={handleChange} className="input w-full">
          <option value="given">Given (Asset — they owe us)</option>
          <option value="taken">Taken (Liability — we owe them)</option>
        </select>
      </div>
      <div className="form-group">
        <label className="input-label">Amount</label>
        <input name="amount" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={handleChange} required className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Date</label>
        <input name="date" type="date" value={form.date} onChange={handleChange} required className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Note</label>
        <input name="note" placeholder="Note" value={form.note} onChange={handleChange} className="input w-full" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">{isEdit ? 'Update Loan' : 'Add Loan'}</button>
      </div>
    </form>
  );
}

function SettlementForm({ onClose, loan, loanPerson }) {
  const { addSettlement } = useLoanStore();
  const [form, setForm] = useState({ amount: '', date: new Date().toISOString().slice(0, 10), note: '' });
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const remaining = loan.amount - (loan.settlements || []).reduce((s, st) => s + st.amount, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(form.amount);
    if (!val || val <= 0 || val > remaining) return;
    await addSettlement(loan.id, { ...form, amount: val });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">
        Loan from <strong>{loanPerson?.name}</strong> &middot;
        Total: <strong>৳{loan.amount.toLocaleString()}</strong> &middot;
        Remaining: <strong>৳{remaining.toLocaleString()}</strong>
      </p>
      <div className="form-group">
        <label className="input-label">Settlement Amount</label>
        <input name="amount" type="number" step="0.01" placeholder={`Max ৳${remaining.toLocaleString()}`} value={form.amount} onChange={handleChange} required max={remaining} className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Date</label>
        <input name="date" type="date" value={form.date} onChange={handleChange} required className="input w-full" />
      </div>
      <div className="form-group">
        <label className="input-label">Note</label>
        <input name="note" placeholder="Note (optional)" value={form.note} onChange={handleChange} className="input w-full" />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" className="btn btn-primary">Record Settlement</button>
      </div>
    </form>
  );
}

export default function LoanBookPage() {
  const { persons, loadPersons, deletePerson } = useLoanPersonStore();
  const { loans, loadLoans, deleteLoan, deleteSettlement } = useLoanStore();

  const [showPersonForm, setShowPersonForm] = useState(false);
  const [editingPerson, setEditingPerson] = useState(null);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [settlingLoan, setSettlingLoan] = useState(null);
  const [selectedPersonId, setSelectedPersonId] = useState(null);

  useEffect(() => { loadPersons(); loadLoans(); }, []);

  const selectedPerson = persons.find((p) => p.id === selectedPersonId);
  const personLoans = loans.filter((l) => l.personId === selectedPersonId);

  const getPersonName = (pid) => persons.find((p) => p.id === pid)?.name || 'Unknown';

  // Summary stats
  const allGiven = loans.filter((l) => l.type === 'given' && l.status === 'active');
  const allTaken = loans.filter((l) => l.type === 'taken' && l.status === 'active');
  const totalGiven = allGiven.reduce((s, l) => s + (l.amount - (l.settlements || []).reduce((a, st) => a + st.amount, 0)), 0);
  const totalTaken = allTaken.reduce((s, l) => s + (l.amount - (l.settlements || []).reduce((a, st) => a + st.amount, 0)), 0);

  const handleDeletePerson = (id, name) => {
    if (confirm(`Delete "${name}" and all their loans?`)) {
      loans.filter((l) => l.personId === id).forEach((l) => deleteLoan(l.id));
      deletePerson(id);
    }
  };

  if (selectedPersonId && selectedPerson) {
    const activeLoans = personLoans.filter((l) => l.status === 'active');
    const settledLoans = personLoans.filter((l) => l.status === 'settled');

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button onClick={() => setSelectedPersonId(null)} className="text-sm text-gray-500 hover:text-gray-700 mb-1">&larr; Back to all persons</button>
            <h2 className="text-2xl font-bold">{selectedPerson.name}</h2>
            {selectedPerson.phone && <p className="text-sm text-gray-500">{selectedPerson.phone}</p>}
            {selectedPerson.address && <p className="text-sm text-gray-500">{selectedPerson.address}</p>}
          </div>
          <button onClick={() => { setEditingLoan(null); setShowLoanForm(true); }} className="btn btn-primary">+ Add Loan</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-500">Active Loans</p>
            <p className="text-xl font-bold">{activeLoans.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Given</p>
            <p className="text-xl font-bold text-green-600">
              ৳{activeLoans.filter((l) => l.type === 'given').reduce((s, l) => s + (l.amount - (l.settlements || []).reduce((a, st) => a + st.amount, 0)), 0).toLocaleString()}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-500">Taken</p>
            <p className="text-xl font-bold text-red-600">
              ৳{activeLoans.filter((l) => l.type === 'taken').reduce((s, l) => s + (l.amount - (l.settlements || []).reduce((a, st) => a + st.amount, 0)), 0).toLocaleString()}
            </p>
          </div>
        </div>

        {activeLoans.map((loan) => {
          const totalSettled = (loan.settlements || []).reduce((s, st) => s + st.amount, 0);
          const remaining = loan.amount - totalSettled;
          return (
            <div key={loan.id} className="card">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-semibold">
                    {loan.type === 'given' ? 'Given (Asset)' : 'Taken (Liability)'}
                    <span className="text-sm font-normal text-gray-500 ml-2">— {new Date(loan.date).toLocaleDateString()}</span>
                  </h3>
                  {loan.note && <p className="text-xs text-gray-400">{loan.note}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSettlingLoan(loan); }} className="btn btn-primary text-xs py-1 px-2">+ Settle</button>
                  <button onClick={() => { setEditingLoan(loan); setShowLoanForm(true); }} className="btn btn-secondary text-xs py-1 px-2">Edit</button>
                  <button onClick={() => { if (confirm('Delete this loan?')) deleteLoan(loan.id); }} className="btn btn-danger text-xs py-1 px-2">Del</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
                <span>Total: <strong>৳{loan.amount.toLocaleString()}</strong></span>
                <span className="text-green-600">Settled: <strong>৳{totalSettled.toLocaleString()}</strong></span>
                <span className={remaining > 0 ? 'text-red-600' : 'text-green-600'}>
                  Remaining: <strong>৳{remaining.toLocaleString()}</strong>
                </span>
              </div>

              {(loan.settlements || []).length > 0 && (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-gray-500">
                      <th className="pb-1 text-xs">Date</th>
                      <th className="pb-1 text-xs">Note</th>
                      <th className="pb-1 text-xs text-right">Amount</th>
                      <th className="pb-1"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(loan.settlements || []).sort((a, b) => a.date.localeCompare(b.date)).map((st) => (
                      <tr key={st.id} className="border-b last:border-0">
                        <td className="py-1 text-xs">{new Date(st.date).toLocaleDateString()}</td>
                        <td className="py-1 text-xs text-gray-500">{st.note || '-'}</td>
                        <td className="py-1 text-xs text-right text-green-600 font-medium">৳{st.amount.toLocaleString()}</td>
                        <td className="py-1 text-right">
                          <button onClick={() => { if (confirm('Delete this settlement?')) deleteSettlement(loan.id, st.id); }}
                            className="text-red-400 hover:text-red-600 text-xs">x</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}

        {activeLoans.length === 0 && <p className="text-gray-500 text-sm">No active loans for this person.</p>}

        {settledLoans.length > 0 && (
          <div className="card">
            <h3 className="font-semibold mb-3 text-gray-500">Settled Loans</h3>
            {settledLoans.map((loan) => (
              <div key={loan.id} className="flex justify-between text-sm py-1 border-b last:border-0">
                <span>{loan.type === 'given' ? 'Given' : 'Taken'} — {new Date(loan.date).toLocaleDateString()}</span>
                <span className="text-gray-500">৳{loan.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        <Modal open={showLoanForm} onClose={() => setShowLoanForm(false)} title={editingLoan ? 'Edit Loan' : 'Add Loan'}>
          <LoanForm loan={editingLoan} persons={persons} onClose={() => { setShowLoanForm(false); setEditingLoan(null); }} />
        </Modal>

        <Modal open={!!settlingLoan} onClose={() => setSettlingLoan(null)} title="Record Settlement">
          {settlingLoan && <SettlementForm loan={settlingLoan} loanPerson={selectedPerson} onClose={() => setSettlingLoan(null)} />}
        </Modal>
      </div>
    );
  }

  // Main persons list view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2>Loan Book</h2>
        <button onClick={() => { setEditingPerson(null); setShowPersonForm(true); }} className="btn btn-primary">+ Add Person</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Persons</p>
          <p className="text-xl font-bold">{persons.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Net Receivable (Given - Taken)</p>
          <p className={`text-xl font-bold ${totalGiven - totalTaken >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ৳{(totalGiven - totalTaken).toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Active Loans</p>
          <p className="text-xl font-bold">{loans.filter((l) => l.status === 'active').length}</p>
        </div>
      </div>

      {persons.length === 0 ? (
        <p className="text-gray-500">No persons added yet. Add a person to start tracking loans.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {persons.map((person) => {
            const personLoans = loans.filter((l) => l.personId === person.id);
            const givenRemaining = personLoans.filter((l) => l.type === 'given' && l.status === 'active')
              .reduce((s, l) => s + (l.amount - (l.settlements || []).reduce((a, st) => a + st.amount, 0)), 0);
            const takenRemaining = personLoans.filter((l) => l.type === 'taken' && l.status === 'active')
              .reduce((s, l) => s + (l.amount - (l.settlements || []).reduce((a, st) => a + st.amount, 0)), 0);

            return (
              <div key={person.id} className="card hover:shadow-md transition cursor-pointer" onClick={() => setSelectedPersonId(person.id)}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold">{person.name}</h3>
                    {person.phone && <p className="text-xs text-gray-500">{person.phone}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={(e) => { e.stopPropagation(); setEditingPerson(person); setShowPersonForm(true); }}
                      className="text-blue-500 hover:text-blue-700 text-xs">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeletePerson(person.id, person.name); }}
                      className="text-red-500 hover:text-red-700 text-xs">Del</button>
                  </div>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-green-600">Given: <strong>৳{givenRemaining.toLocaleString()}</strong></span>
                  <span className="text-red-600">Taken: <strong>৳{takenRemaining.toLocaleString()}</strong></span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{personLoans.length} loan(s) &middot; {personLoans.filter((l) => l.status === 'active').length} active</p>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={showPersonForm} onClose={() => setShowPersonForm(false)} title={editingPerson ? 'Edit Person' : 'Add Person'}>
        <PersonForm person={editingPerson} onClose={() => { setShowPersonForm(false); setEditingPerson(null); }} />
      </Modal>
    </div>
  );
}
