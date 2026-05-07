import { defineStore } from "pinia"
import type { User } from "@/app/types/user"
import type { CustomerAccount } from "@/app/types/customer"
import AuthService from "@/app/services/auth"
import { useCompanyStore } from "@/app/stores/company"
import { useSystemSettingsStore } from "@/app/stores/system-settings"

const TOKEN_KEY = "auth_token"
const AUTH_TYPE_KEY = "auth_type"

type AuthType = "user" | "customer"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    customer: null as CustomerAccount | null,

    token: localStorage.getItem(TOKEN_KEY),
    authType: localStorage.getItem(AUTH_TYPE_KEY) as AuthType | null,

    ready: false,
  }),

  getters: {
    isAuthenticated: state => !!state.token && (!!state.user || !!state.customer),

    isCustomer: state => state.authType === "customer",
    isUser: state => state.authType === "user",

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

    setCustomer(customer: CustomerAccount | null) {
      this.customer = customer
    },

    clear() {
      this.user = null
      this.customer = null
      this.token = null
      this.authType = null

      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(AUTH_TYPE_KEY)

      const systemSettingsStore = useSystemSettingsStore()
      systemSettingsStore.setEoriNumber("")
    },

    async initializeAppData() {
      if (this.authType === "customer") {
        return
      }

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
      this.authType = "user"

      this.setUser(result.user)
      this.setCustomer(null)

      localStorage.setItem(TOKEN_KEY, result.token)
      localStorage.setItem(AUTH_TYPE_KEY, "user")

      await this.initializeAppData()
    },

    async customerLogin(email: string, password: string) {
      const result = await AuthService.customerLogin({ email, password })

      this.token = result.token
      this.authType = "customer"

      this.setCustomer(result.customer)
      this.setUser(null)

      localStorage.setItem(TOKEN_KEY, result.token)
      localStorage.setItem(AUTH_TYPE_KEY, "customer")
    },

    async hydrate() {
      if (!this.token) {
        this.ready = true
        return
      }

      if (this.authType === "customer") {
        this.ready = true
        return
      }

      try {
        const user = await AuthService.me()

        this.setUser(user)
        this.setCustomer(null)
        this.authType = "user"

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
