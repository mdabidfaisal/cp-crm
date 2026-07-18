import { create } from 'zustand'
import googleDrive from '../services/googleDrive'

export const useClientStore = create((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,

  loadClients: async () => {
    set({ isLoading: true })
    try {
      const clientsFolder = localStorage.getItem('crm_clients_folder_id')
      if (!clientsFolder) {
        set({ clients: [], isLoading: false })
        return
      }
      const file = await googleDrive.findFile('clients.json', clientsFolder)
      if (file) {
        const data = await googleDrive.loadFile(file.id)
        set({ clients: data.clients || [], isLoading: false })
      } else {
        set({ clients: [], isLoading: false })
      }
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  addClient: async (client) => {
    try {
      const { clients } = get()
      const updated = { clients: [...clients, { id: crypto.randomUUID(), ...client }] }
      const clientsFolder = localStorage.getItem('crm_clients_folder_id')
      await googleDrive.saveFile('clients.json', updated, clientsFolder)
      set({ clients: updated.clients })
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateClient: async (id, data) => {
    try {
      const { clients } = get()
      const updated = { clients: clients.map((c) => (c.id === id ? { ...c, ...data } : c)) }
      const clientsFolder = localStorage.getItem('crm_clients_folder_id')
      await googleDrive.saveFile('clients.json', updated, clientsFolder)
      set({ clients: updated.clients })
    } catch (error) {
      set({ error: error.message })
    }
  },

  deleteClient: async (id) => {
    try {
      const { clients } = get()
      const updated = { clients: clients.filter((c) => c.id !== id) }
      const clientsFolder = localStorage.getItem('crm_clients_folder_id')
      await googleDrive.saveFile('clients.json', updated, clientsFolder)
      set({ clients: updated.clients })
    } catch (error) {
      set({ error: error.message })
    }
  },
}))
