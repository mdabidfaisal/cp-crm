import { useInvoices } from '../../hooks/useInvoices'
import { formatCurrency } from '../../utils/formatters'
import { useState } from 'react'

export default function InvoicesList() {
  const { invoices, isLoading, deleteInvoice } = useInvoices()
  const [showDelete, setShowDelete] = useState(null)

  const handleDelete = async (id) => {
    await deleteInvoice(id)
    setShowDelete(null)
  }

  if (isLoading) return <p className="text-gray-500">Loading invoices...</p>

  if (invoices.length === 0) {
    return (
      <div className="card-flat text-center py-12 text-gray-500">
        <p className="text-lg">No invoices yet</p>
        <p className="text-sm mt-1">Click "+ New Invoice" to create your first invoice.</p>
      </div>
    )
  }

  return (
    <div className="card-flat p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="table-header bg-gray-50">
            <th className="px-4 py-3">Invoice No</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Items</th>
            <th className="px-4 py-3 text-right">Total</th>
            <th className="px-4 py-3 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {[...invoices].reverse().map((inv) => (
            <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
              <td className="px-4 py-3">{inv.clientName || inv.clientCompany || '-'}</td>
              <td className="px-4 py-3 text-gray-500">
                {inv.date ? new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </td>
              <td className="px-4 py-3 text-right">{inv.items?.length || 0}</td>
              <td className="px-4 py-3 text-right font-semibold">{formatCurrency(inv.total)}</td>
              <td className="px-4 py-3 text-center">
                {showDelete === inv.id ? (
                  <span className="flex items-center justify-center gap-1 text-xs">
                    <span className="text-gray-500">Sure?</span>
                    <button onClick={() => handleDelete(inv.id)} className="text-red-600 hover:text-red-800 font-medium">Yes</button>
                    <button onClick={() => setShowDelete(null)} className="text-gray-500 hover:text-gray-700">No</button>
                  </span>
                ) : (
                  <button onClick={() => setShowDelete(inv.id)} className="text-red-500 hover:text-red-700 text-xs">Delete</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
