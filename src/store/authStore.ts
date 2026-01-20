import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string | null) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      
      setAuth: (user, token) => {
        set({ user, token })
      },
      
      logout: async () => {
        try {
          // Call logout API to clear HTTP-only cookie
          await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          })
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          // Clear local state regardless of API call success
          set({ user: null, token: null })
        }
      },
      
      isAdmin: () => {
        return get().user?.role === 'admin'
      },
    }),
    {
      name: 'auth-storage',
    }
  )
)
