import { defineStore } from "pinia"

import accountsSummaryService from "@/app/services/accounts-summary"
import type {
  AccountsSummary,
  AccountsSupplierLog,
  AccountsSupplierPayment,
} from "@/app/types/accounts-summary"

function emptySummary(): AccountsSummary {
  return {
    customerInvoices: [],
    supplierInvoices: [],
    overviewSummary: [],
    overviewRows: [],
    creditCashSnapshot: [],
    accountStatusSummary: [],
    pendingJobs: [],
    supplierLog: [],
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function nowStamp(): string {
  return new Date().toLocaleString("en-GB")
}

type State = AccountsSummary & {
  loading: boolean
  error: string | null
  loaded: boolean
  selectedSupplierId: string
}

export const useAccountsSummaryStore = defineStore("accounts-summary", {
  state: (): State => ({
    ...emptySummary(),
    loading: false,
    error: null,
    loaded: false,
    selectedSupplierId: "",
  }),

  getters: {
    selectedSupplier(state): AccountsSupplierPayment | null {
      return (
        state.supplierInvoices.find(invoice => invoice.id === state.selectedSupplierId) ??
        state.supplierInvoices[0] ??
        null
      )
    },
  },

  actions: {
    async fetch(force = false) {
      if (this.loading || (this.loaded && !force)) return

      this.loading = true
      this.error = null

      try {
        const result = await accountsSummaryService.show()
        Object.assign(this, result)
        this.loaded = true

        if (!this.selectedSupplierId && this.supplierInvoices[0]) {
          this.selectedSupplierId = this.supplierInvoices[0].id
        }
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Unable to load accounts summary."
        throw error
      } finally {
        this.loading = false
      }
    },

    approveSuppliers(ids: string[]) {
      const date = today()
      this.updateSuppliers(ids, invoice => {
        invoice.approved = true
        invoice.approvedDate = date
        if (invoice.status !== "paid") invoice.status = "approved"
      })
      this.log("Supplier invoices approved", `${ids.length} supplier invoice(s) approved.`)
    },

    scheduleSuppliers(ids: string[]) {
      this.updateSuppliers(ids, invoice => {
        invoice.approved = true
        invoice.approvedDate ||= today()
        if (invoice.status !== "paid") invoice.status = "scheduled"
      })
      this.log("Supplier payments scheduled", `${ids.length} supplier payment(s) scheduled.`)
    },

    paySuppliers(ids: string[], method: string) {
      const date = today()
      this.updateSuppliers(ids, invoice => {
        invoice.approved = true
        invoice.approvedDate ||= date
        invoice.paid = true
        invoice.paidDate = date
        invoice.paymentMethod = method
        invoice.status = "paid"
      })
      this.log(
        "Supplier payments marked paid",
        `${ids.length} supplier payment(s) paid by ${method}.`,
      )
    },

    updateSuppliers(ids: string[], updater: (invoice: AccountsSupplierPayment) => void) {
      this.supplierInvoices.forEach(invoice => {
        if (ids.includes(invoice.id)) updater(invoice)
      })
    },

    log(title: string, text: string) {
      const entry: AccountsSupplierLog = {
        id: `${Date.now()}-${Math.random()}`,
        title,
        ts: nowStamp(),
        text,
      }

      this.supplierLog = [entry, ...this.supplierLog].slice(0, 8)
    },
  },
})
