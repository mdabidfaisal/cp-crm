import { create } from 'zustand'
import googleDrive from '../services/googleDrive'

export const useTransactionStore = create((set, get) => ({
  transactions: [],
  isLoading: false,
  error: null,

  loadTransactions: async () => {
    set({ isLoading: true })
    try {
      const transFolder = localStorage.getItem('crm_transactions_folder_id')
      if (!transFolder) {
        set({ transactions: [], isLoading: false })
        return
      }
      const file = await googleDrive.findFile('transactions.json', transFolder)
      if (file) {
        const data = await googleDrive.loadFile(file.id)
        set({ transactions: data.transactions || [], isLoading: false })
      } else {
        set({ transactions: [], isLoading: false })
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  addTransaction: async (transaction) => {
    try {
      const { transactions } = get()
      const newTxn = { ...transaction, id: Date.now().toString() }
      const updated = { transactions: [...transactions, newTxn] }
      const transFolder = localStorage.getItem('crm_transactions_folder_id')
      await googleDrive.saveFile('transactions.json', updated, transFolder)
      set({ transactions: updated.transactions })
      return newTxn.id
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateTransaction: async (id, data) => {
    try {
      const { transactions } = get()
      const updated = { transactions: transactions.map((t) => (t.id === id ? { ...t, ...data } : t)) }
      const transFolder = localStorage.getItem('crm_transactions_folder_id')
      await googleDrive.saveFile('transactions.json', updated, transFolder)
      set({ transactions: updated.transactions })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteTransaction: async (id) => {
    try {
      const { transactions } = get()
      const updated = { transactions: transactions.filter((t) => t.id !== id) }
      const transFolder = localStorage.getItem('crm_transactions_folder_id')
      await googleDrive.saveFile('transactions.json', updated, transFolder)
      set({ transactions: updated.transactions })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },
}))
