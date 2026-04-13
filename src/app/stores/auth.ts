import { defineStore } from "pinia"
import type { User } from "@/app/types/user"
import AuthService from "@/app/services/auth"
import { useCompanyStore } from "@/app/stores/company"
import { useSystemSettingsStore } from "@/app/stores/system-settings"

const TOKEN_KEY = "auth_token"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem(TOKEN_KEY),
    ready: false,
  }),

  getters: {
    isAuthenticated: state => !!state.user && !!state.token,
    roles: state => state.user?.roles ?? [],
    permissions: state => state.user?.permissions ?? [],
    isAdmin: state => state.user?.is_admin ?? false,
    isDev: state => state.user?.is_dev ?? false,

    hasRole: state => {
      return (role: string): boolean => state.user?.roles.includes(role) ?? false
    },

    hasPermission: state => {
      return (permission: string): boolean => state.user?.permissions.includes(permission) ?? false
    },
  },

  actions: {
    setUser(user: User | null) {
      this.user = user
    },

    clear() {
      this.user = null
      this.token = null
      localStorage.removeItem(TOKEN_KEY)

      const systemSettingsStore = useSystemSettingsStore()
      systemSettingsStore.setEoriNumber("")
    },

    async initializeAppData() {
      const companyStore = useCompanyStore()
      const systemSettingsStore = useSystemSettingsStore()

      try {
        const company = await companyStore.fetch()
        systemSettingsStore.setEoriNumber(company?.eori_number ?? "")
      } catch {
        systemSettingsStore.setEoriNumber("")
      }
    },

    async login(email: string, password: string) {
      const result = await AuthService.login({ email, password })

      this.token = result.token
      this.setUser(result.user)

      localStorage.setItem(TOKEN_KEY, result.token)

      await this.initializeAppData()
    },

    async hydrate() {
      if (!this.token) {
        this.ready = true
        return
      }

      try {
        const user = await AuthService.me()
        this.setUser(user)

        await this.initializeAppData()
      } catch {
        this.clear()
      } finally {
        this.ready = true
      }
    },

    async logout() {
      try {
        await AuthService.logout()
      } finally {
        this.clear()
      }
    },
  },
})
