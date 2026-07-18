import { useInvoiceStore } from '../store/invoiceStore'

export function useInvoices() {
  const invoices = useInvoiceStore((s) => s.invoices)
  const isLoading = useInvoiceStore((s) => s.isLoading)
  const loadInvoices = useInvoiceStore((s) => s.loadInvoices)
  const addInvoice = useInvoiceStore((s) => s.addInvoice)
  const deleteInvoice = useInvoiceStore((s) => s.deleteInvoice)

  return { invoices, isLoading, loadInvoices, addInvoice, deleteInvoice }
}
