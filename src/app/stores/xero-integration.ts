import { defineStore } from "pinia"
import xeroService from "@/app/services/xero"
import type {
  XeroAccountOption,
  XeroPendingOrganisations,
  XeroSettingsPayload,
  XeroStatus,
  XeroTaxRateOption,
} from "@/app/types/xero"

export const useXeroIntegrationStore = defineStore("xero-integration", {
  state: () => ({
    status: null as XeroStatus | null,
    pending: null as XeroPendingOrganisations | null,
    accounts: [] as XeroAccountOption[],
    taxRates: [] as XeroTaxRateOption[],
    loading: false,
    connecting: false,
    testing: false,
    saving: false,
    disconnecting: false,
    selecting: false,
    error: null as string | null,
    syncingInvoiceId: null as number | null,
    syncResults: {} as Record<number, import("@/app/types/xero").XeroSyncResult>,
  }),
  actions: {
    async fetchStatus(loadOptions = true) {
      this.loading = true
      this.error = null
      try {
        this.status = await xeroService.status()
        if (loadOptions && this.status.status === "connected") await this.fetchOptions()
        return this.status
      } finally {
        this.loading = false
      }
    },
    async startConnection(reconnect = false) {
      this.connecting = true
      this.error = null
      try {
        const result = await xeroService.connect(reconnect)
        window.location.assign(result.authorizationUrl)
      } catch (error: any) {
        this.connecting = false
        this.error = error?.response?.data?.message || "Unable to prepare the Xero connection."
        throw error
      }
    },
    async fetchPending(selectionId: string) {
      this.pending = await xeroService.pendingOrganisations(selectionId)
      return this.pending
    },
    async selectOrganisation(organisationId: string, confirmReplace: boolean) {
      if (!this.pending) throw new Error("Xero organisation selection is missing.")
      this.selecting = true
      try {
        await xeroService.selectOrganisation({
          selectionId: this.pending.selectionId,
          organisationId,
          confirmReplace,
        })
        this.pending = null
        return await this.fetchStatus()
      } finally {
        this.selecting = false
      }
    },
    async fetchOptions() {
      const result = await xeroService.options()
      this.accounts = result.accounts
      this.taxRates = result.taxRates
    },
    async saveSettings(payload: XeroSettingsPayload) {
      this.saving = true
      try {
        const settings = await xeroService.saveSettings(payload)
        if (this.status) {
          this.status.settings = settings
          this.status.settingsComplete = Boolean(
            settings.defaultSalesAccountCode && settings.defaultTaxType,
          )
        }
        return settings
      } finally {
        this.saving = false
      }
    },
    async testConnection() {
      this.testing = true
      try {
        await xeroService.test()
        return await this.fetchStatus(false)
      } finally {
        this.testing = false
      }
    },
    async disconnect() {
      this.disconnecting = true
      try {
        await xeroService.disconnect()
        this.accounts = []
        this.taxRates = []
        return await this.fetchStatus(false)
      } finally {
        this.disconnecting = false
      }
    },
    async syncInvoice(invoiceId: number) {
      this.syncingInvoiceId = invoiceId
      try {
        const result = await xeroService.syncInvoice(invoiceId)
        this.syncResults[invoiceId] = result
        return result
      } finally {
        this.syncingInvoiceId = null
      }
    },
  },
})
