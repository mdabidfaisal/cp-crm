import { create } from 'zustand'
import googleDrive from '../services/googleDrive'

export const useProjectStore = create((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true })
    try {
      const projectsFolder = localStorage.getItem('crm_projects_folder_id')
      if (!projectsFolder) {
        set({ projects: [], isLoading: false })
        return
      }
      const files = await googleDrive.listFiles(projectsFolder)
      const projectsData = []
      for (const file of files) {
        if (file.name.endsWith('.json')) {
          const data = await googleDrive.loadFile(file.id)
          projectsData.push({ ...data, driveId: file.id })
        }
      }
      set({ projects: projectsData, isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  saveProject: async (project) => {
    try {
      const projectsFolder = localStorage.getItem('crm_projects_folder_id')
      const fileId = await googleDrive.saveFile(
        `project-${project.id}.json`,
        project,
        projectsFolder
      )
      set((state) => ({
        projects: [...state.projects, { ...project, driveId: fileId }]
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  updateProject: async (projectId, updates) => {
    try {
      const { projects } = get()
      const project = projects.find((p) => p.id === projectId)
      if (!project) throw new Error('Project not found')
      const updated = { ...project, ...updates }
      await googleDrive.updateFile(project.driveId, JSON.stringify(updated, null, 2))
      set((state) => ({
        projects: state.projects.map((p) => (p.id === projectId ? updated : p))
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

  deleteProject: async (projectId) => {
    try {
      const { projects } = get()
      const project = projects.find((p) => p.id === projectId)
      if (!project) throw new Error('Project not found')
      await googleDrive.deleteFile(project.driveId)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== projectId)
      }))
    } catch (error) {
      set({ error: error.message })
      throw error
    }
  },

}))
