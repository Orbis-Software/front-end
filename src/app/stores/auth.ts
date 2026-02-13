import { defineStore } from 'pinia'
import type { User } from '@/app/types/user'
import AuthService from '@/app/services/auth'

const TOKEN_KEY = 'auth_token'

export const useAuthStore = defineStore('auth', {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem(TOKEN_KEY),
    ready: false,
  }),

  /*
  |--------------------------------------------------------------------------
  | Getters
  |--------------------------------------------------------------------------
  */
  getters: {
    /**
     * Basic Auth State
     */
    isAuthenticated: (state) => !!state.user && !!state.token,

    /**
     * Role helpers
     */
    roles: (state) => state.user?.roles ?? [],
    permissions: (state) => state.user?.permissions ?? [],

    isAdmin: (state) => state.user?.is_admin ?? false,
    isDev: (state) => state.user?.is_dev ?? false,

    /**
     * Dynamic Role Checker
     */
    hasRole: (state) => {
      return (role: string): boolean =>
        state.user?.roles.includes(role) ?? false
    },

    /**
     * Dynamic Permission Checker
     */
    hasPermission: (state) => {
      return (permission: string): boolean =>
        state.user?.permissions.includes(permission) ?? false
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Actions
  |--------------------------------------------------------------------------
  */
  actions: {
    /**
     * Replace user explicitly
     */
    setUser(user: User | null) {
      this.user = user
    },

    /**
     * Clear auth state (logout, token expiry)
     */
    clear() {
      this.user = null
      this.token = null
      localStorage.removeItem(TOKEN_KEY)
    },

    /*
    |--------------------------------------------------------------------------
    | Auth Actions (Store → Service)
    |--------------------------------------------------------------------------
    */

    async login(email: string, password: string) {
      const result = await AuthService.login({ email, password })

      this.token = result.token
      this.setUser(result.user)

      localStorage.setItem(TOKEN_KEY, result.token)
    },

    /**
     * Hydrate user on app reload
     */
    async hydrate() {
      if (!this.token) {
        this.ready = true
        return
      }

      try {
        const user = await AuthService.me()
        this.setUser(user)
      } catch {
        this.clear()
      } finally {
        this.ready = true
      }
    },

    /**
     * Logout current device
     */
    async logout() {
      try {
        await AuthService.logout()
      } finally {
        this.clear()
      }
    },
  },
})
