import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiClient } from "@/lib/api/client"

interface User {
  id: string
  name: string
  email: string
  role: "employee" | "reviewer" | "admin"
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await apiClient.post("/auth/login", { email, password })
        const { user, accessToken, refreshToken } = response.data
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },

      register: async (name, email, password) => {
        const response = await apiClient.post("/auth/register", { name, email, password })
        const { user, accessToken, refreshToken } = response.data
        set({ user, accessToken, refreshToken, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: "meetsync-auth", // the name this gets saved under in localStorage
    }
  )
)