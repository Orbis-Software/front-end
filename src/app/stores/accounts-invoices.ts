import { defineStore } from "pinia"

import accountsInvoiceService from "@/app/services/accounts-invoices"
import type {
  AccountsInvoice,
  AccountsInvoiceFilters,
  AccountsInvoiceMeta,
} from "@/app/types/accounts-invoice"

type State = {
  invoices: AccountsInvoice[]
  meta: AccountsInvoiceMeta
  loading: boolean
  error: string | null
}

export const useAccountsInvoiceStore = defineStore("accounts-invoices", {
  state: (): State => ({
    invoices: [],
    meta: {
      total: 0,
      filtered: 0,
      currentPage: 1,
      lastPage: 1,
      perPage: 25,
      from: null,
      to: null,
    },
    loading: false,
    error: null,
  }),

  actions: {
    async fetch(params: AccountsInvoiceFilters = {}) {
      this.loading = true
      this.error = null

      try {
        const result = await accountsInvoiceService.list(params)
        this.invoices = result.invoices
        this.meta = result.meta
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || "Unable to load invoices."
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
