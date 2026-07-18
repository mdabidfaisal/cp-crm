import { create } from 'zustand'
import googleDrive from '../services/googleDrive'

export const useInvoiceStore = create((set, get) => ({
  invoices: [],
  isLoading: false,
  error: null,

  loadInvoices: async () => {
    set({ isLoading: true })
    try {
      const invoicesFolder = localStorage.getItem('crm_invoices_folder_id')
      if (!invoicesFolder) {
        set({ invoices: [], isLoading: false })
        return
      }
      const file = await googleDrive.findFile('invoices.json', invoicesFolder)
      if (file) {
        const data = await googleDrive.loadFile(file.id)
        set({ invoices: data.invoices || [], isLoading: false })
      } else {
        set({ invoices: [], isLoading: false })
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  addInvoice: async (invoice) => {
    try {
      const { invoices } = get()
      const updated = { invoices: [...invoices, { id: crypto.randomUUID(), ...invoice }] }
      const invoicesFolder = localStorage.getItem('crm_invoices_folder_id')
      await googleDrive.saveFile('invoices.json', updated, invoicesFolder)
      set({ invoices: updated.invoices })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteInvoice: async (id) => {
    try {
      const { invoices } = get()
      const updated = { invoices: invoices.filter((i) => i.id !== id) }
      const invoicesFolder = localStorage.getItem('crm_invoices_folder_id')
      await googleDrive.saveFile('invoices.json', updated, invoicesFolder)
      set({ invoices: updated.invoices })
    } catch (error) {
      set({ error: error.message })
    }
  },
}))
