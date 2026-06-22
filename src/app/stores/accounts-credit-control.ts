import { defineStore } from "pinia"

import accountsCreditControlService from "@/app/services/accounts-credit-control"
import type { AccountsCreditMeta, AccountsCreditRow } from "@/app/types/accounts-credit-control"

type State = {
  rows: AccountsCreditRow[]
  meta: AccountsCreditMeta
  loading: boolean
  error: string | null
}

export const useAccountsCreditControlStore = defineStore("accounts-credit-control", {
  state: (): State => ({
    rows: [],
    meta: {
      totalCustomers: 0,
      onHoldCustomers: 0,
      overdueCustomers: 0,
      totalOutstanding: 0,
    },
    loading: false,
    error: null,
  }),

  actions: {
    async fetch() {
      this.loading = true
      this.error = null

      try {
        const result = await accountsCreditControlService.list()
        this.rows = result.rows
        this.meta = result.meta
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load credit control data from the backend."
        this.rows = []
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
