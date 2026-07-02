import { defineStore } from "pinia"
import accountSettingsService from "@/app/services/account-settings"
import type {
  AccountSetting,
  AccountSettingPayload,
  AccountingSystem,
} from "@/app/types/account-setting"

type State = {
  settings: AccountSetting[]
  loading: boolean
  saving: boolean
  loaded: boolean
  error: string | null
}

export const useAccountSettingsStore = defineStore("account-settings", {
  state: (): State => ({
    settings: [],
    loading: false,
    saving: false,
    loaded: false,
    error: null,
  }),

  getters: {
    bySystem: state => {
      return (system: AccountingSystem) =>
        state.settings.find(setting => setting.accountingSystem === system) ?? null
    },
  },

  actions: {
    async fetch() {
      this.loading = true
      this.error = null

      try {
        this.settings = await accountSettingsService.list()
        this.loaded = true
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to load account settings."
        throw error
      } finally {
        this.loading = false
      }
    },

    async save(payload: AccountSettingPayload, id?: number | null) {
      this.saving = true
      this.error = null

      try {
        const saved = await accountSettingsService.save(payload, id)
        const index = this.settings.findIndex(
          setting => setting.accountingSystem === saved.accountingSystem,
        )

        if (index >= 0) this.settings.splice(index, 1, saved)
        else this.settings.push(saved)

        if (saved.isDefault) {
          this.settings = this.settings.map(setting =>
            setting.accountingSystem === saved.accountingSystem
              ? setting
              : { ...setting, isDefault: false },
          )
        }

        return saved
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to save account settings."
        throw error
      } finally {
        this.saving = false
      }
    },

    async reset() {
      this.saving = true
      this.error = null

      try {
        this.settings = await accountSettingsService.reset()
        this.loaded = true
      } finally {
        this.saving = false
      }
    },
  },
})
