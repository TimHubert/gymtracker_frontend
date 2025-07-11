import { defineStore } from 'pinia'
import axios from 'axios'
import { createApiUrl, API_CONFIG } from '../config/api'

interface User {
  id: number
  username: string
  email: string
}

interface LoginCredentials {
  username: string
  password: string
}

interface RegisterData {
  username: string
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    getUser: (state) => state.user,
    getError: (state) => state.error,
  },

  actions: {
    async login(credentials: LoginCredentials) {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.post(createApiUrl(API_CONFIG.AUTH.LOGIN), credentials)

        this.token = response.data.token
        this.user = response.data.user

        localStorage.setItem('token', this.token!)
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return { success: true }
      } catch (error: unknown) {
        this.error = (error as any).response?.data?.message || 'Login fehlgeschlagen'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async register(userData: RegisterData) {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.post(createApiUrl(API_CONFIG.AUTH.REGISTER), userData)

        this.token = response.data.token
        this.user = response.data.user

        localStorage.setItem('token', this.token!)
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return { success: true }
      } catch (error: unknown) {
        this.error = (error as any).response?.data?.message || 'Registrierung fehlgeschlagen'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      try {
        if (this.token) {
          await axios.post(createApiUrl(API_CONFIG.AUTH.LOGOUT))
        }
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.user = null
        this.token = null
        this.error = null

        localStorage.removeItem('token')
        delete axios.defaults.headers.common['Authorization']
      }
    },

    async getCurrentUser() {
      if (!this.token) return

      try {
        const response = await axios.get(createApiUrl(API_CONFIG.AUTH.ME))
        this.user = response.data
      } catch (error) {
        console.error('Get current user error:', error)
        this.logout()
      }
    },

    async updateProfile(profileData: Partial<User>) {
      this.isLoading = true
      this.error = null

      try {
        const response = await axios.put(createApiUrl(API_CONFIG.AUTH.PROFILE), profileData)
        this.user = response.data
        return { success: true }
      } catch (error: unknown) {
        this.error = (error as any).response?.data?.message || 'Profil-Update fehlgeschlagen'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    initializeAuth() {
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        this.getCurrentUser()
      }
    },

    clearError() {
      this.error = null
    },
  },
})
