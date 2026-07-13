import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  user: null,
  isSignedIn: false,
  isLoading: false,

  setUser: (user) => set({ user, isSignedIn: !!user }),

  logout: () => {
    set({ user: null, isSignedIn: false })
  },
}))