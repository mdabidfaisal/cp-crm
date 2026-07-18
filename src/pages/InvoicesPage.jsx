import { useState } from 'react'
import Modal from '../components/Common/Modal'
import InvoiceForm from '../components/Invoices/InvoiceForm'
import InvoicesList from '../components/Invoices/InvoicesList'

export default function InvoicesPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Invoices</h2>
        <button onClick={() => setShowForm(true)} className="btn btn-primary">+ New Invoice</button>
      </div>
      <InvoicesList />
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Invoice" className="max-w-4xl">
        <InvoiceForm onClose={() => setShowForm(false)} />
      </Modal>
    </div>
  )
}
