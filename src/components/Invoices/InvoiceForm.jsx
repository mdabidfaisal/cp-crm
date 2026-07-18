import { useState, useMemo } from 'react'
import { useClients } from '../../hooks/useClients'
import { useInvoices } from '../../hooks/useInvoices'
import { generateInvoicePdf } from '../../utils/generateInvoicePdf'
import { formatCurrency } from '../../utils/formatters'

function generateInvoiceNumber(count) {
  const year = new Date().getFullYear()
  const num = String(count + 1).padStart(3, '0')
  return `INV-${year}-${num}`
}

function emptyItem() {
  return { id: crypto.randomUUID(), item: '', specification: '', quantity: 1, unitPrice: 0 }
}

export default function InvoiceForm({ onClose }) {
  const { clients } = useClients()
  const { invoices, addInvoice } = useInvoices()
  const [generating, setGenerating] = useState(false)

  const invoiceNumber = useMemo(() => generateInvoiceNumber(invoices.length), [invoices.length])

  const [form, setForm] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    invoiceNumber,
  })

  const [items, setItems] = useState([emptyItem()])

  const selectedClient = clients.find((c) => c.id === form.clientId)

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0),
    [items]
  )

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleItemChange = (id, field, value) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const addItem = () => setItems([...items, emptyItem()])
  const removeItem = (id) => {
    if (items.length > 1) setItems(items.filter((item) => item.id !== id))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.clientId) return
    setGenerating(true)
    try {
      const invoiceData = {
        ...form,
        items: items.map(({ id, item, specification, quantity, unitPrice }) => ({
          id,
          item,
          specification,
          quantity: Number(quantity),
          unitPrice: Number(unitPrice),
        })),
        subtotal,
        total: subtotal,
        clientName: selectedClient?.name || '',
        clientCompany: selectedClient?.company || '',
        clientEmail: selectedClient?.email || '',
        clientPhone: selectedClient?.phone || '',
        clientAddress: selectedClient?.address || '',
        createdAt: new Date().toISOString(),
      }

      await addInvoice(invoiceData)
      await generateInvoicePdf(invoiceData, selectedClient)
      onClose()
    } catch (error) {
      console.error('Failed to generate invoice:', error)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="form-group">
          <label className="input-label">Client *</label>
          <select name="clientId" value={form.clientId} onChange={handleFormChange} required className="input w-full">
            <option value="">Select a client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="input-label">Invoice Date</label>
          <input type="date" name="date" value={form.date} onChange={handleFormChange} required className="input w-full" />
        </div>
      </div>
      <div className="form-group">
        <label className="input-label">Invoice Number</label>
        <input name="invoiceNumber" value={form.invoiceNumber} onChange={handleFormChange} className="input w-64" />
      </div>

      {selectedClient && (
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <strong className="text-gray-800">{selectedClient.name}</strong>
          {selectedClient.company && <span> — {selectedClient.company}</span>}
          <br />
          {selectedClient.email && <span>{selectedClient.email} </span>}
          {selectedClient.phone && <span>| {selectedClient.phone}</span>}
        </div>
      )}

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="input-label mb-0">Invoice Items</label>
          <button type="button" onClick={addItem} className="btn btn-secondary text-xs py-1 px-3">
            + Add Item
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-2 py-2 w-8">#</th>
                <th className="px-2 py-2">Work / Item</th>
                <th className="px-2 py-2">Feature / Specification</th>
                <th className="px-2 py-2 w-16 text-center">Qty</th>
                <th className="px-2 py-2 w-28 text-right">Unit Price</th>
                <th className="px-2 py-2 w-28 text-right">Total</th>
                <th className="px-2 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="px-2 py-1.5 text-center text-gray-500">{idx + 1}</td>
                  <td className="px-2 py-1.5">
                    <input
                      value={item.item}
                      onChange={(e) => handleItemChange(item.id, 'item', e.target.value)}
                      placeholder="e.g. Website Development"
                      required
                      className="input w-full text-sm py-1.5"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={item.specification}
                      onChange={(e) => handleItemChange(item.id, 'specification', e.target.value)}
                      placeholder="e.g. Custom CRM with React"
                      className="input w-full text-sm py-1.5"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                      required
                      className="input w-full text-sm py-1.5 text-center"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      required
                      className="input w-full text-sm py-1.5 text-right"
                    />
                  </td>
                  <td className="px-2 py-1.5 text-right font-medium">
                    {formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-lg leading-none">
                        &times;
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t pt-3 flex justify-end">
        <div className="w-48 space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-1">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
        <button type="submit" disabled={generating || !form.clientId} className="btn btn-primary">
          {generating ? 'Generating...' : 'Generate Invoice PDF'}
        </button>
      </div>
    </form>
  )
}
