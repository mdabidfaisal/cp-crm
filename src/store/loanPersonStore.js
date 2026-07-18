import { create } from 'zustand'
import googleDrive from '../services/googleDrive'

const FILE_NAME = 'loan-persons.json';

function getLoansFolder() {
  return localStorage.getItem('crm_loans_folder_id');
}

export const useLoanPersonStore = create((set, get) => ({
  persons: [],
  isLoading: false,

  loadPersons: async () => {
    set({ isLoading: true })
    try {
      const folderId = getLoansFolder();
      if (!folderId) { set({ persons: [], isLoading: false }); return }
      const file = await googleDrive.findFile(FILE_NAME, folderId)
      if (file) {
        const data = await googleDrive.loadFile(file.id)
        set({ persons: data.persons || [], isLoading: false })
      } else {
        set({ persons: [], isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
    }
  },

  addPerson: async (person) => {
    try {
      const folderId = getLoansFolder();
      const { persons } = get()
      const newPerson = { id: crypto.randomUUID(), ...person, createdAt: new Date().toISOString() }
      const updated = { persons: [...persons, newPerson] }
      await googleDrive.saveFile(FILE_NAME, updated, folderId)
      set({ persons: updated.persons })
    } catch (error) {
      throw error
    }
  },

  updatePerson: async (id, data) => {
    try {
      const folderId = getLoansFolder();
      const { persons } = get()
      const updated = { persons: persons.map((p) => (p.id === id ? { ...p, ...data } : p)) }
      await googleDrive.saveFile(FILE_NAME, updated, folderId)
      set({ persons: updated.persons })
    } catch (error) {
      throw error
    }
  },

  deletePerson: async (id) => {
    try {
      const folderId = getLoansFolder();
      const { persons } = get()
      const updated = { persons: persons.filter((p) => p.id !== id) }
      await googleDrive.saveFile(FILE_NAME, updated, folderId)
      set({ persons: updated.persons })
    } catch (error) {
      throw error
    }
  },
}))
