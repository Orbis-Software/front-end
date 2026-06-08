import { defineStore } from "pinia"
import clientBankDetailService from "@/app/services/client-bank-details"
import type {
  ClientBankDetail,
  ClientBankDetailFilters,
  ClientBankDetailPayload,
} from "@/app/types/client-bank-detail"

type State = {
  bankDetails: ClientBankDetail[]
  total: number
  filtered: number
  currentPage: number
  lastPage: number
  perPage: number
  from: number | null
  to: number | null
  loading: boolean
  saving: boolean
  error: string | null
}

export const useClientBankDetailStore = defineStore("client-bank-details", {
  state: (): State => ({
    bankDetails: [],
    total: 0,
    filtered: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 15,
    from: null,
    to: null,
    loading: false,
    saving: false,
    error: null,
  }),

  actions: {
    async fetch(params: ClientBankDetailFilters = {}) {
      this.loading = true
      this.error = null

      try {
        const result = await clientBankDetailService.list(params)
        this.bankDetails = result.bankDetails
        this.total = result.meta.total
        this.filtered = result.meta.filtered
        this.currentPage = result.meta.currentPage
        this.lastPage = result.meta.lastPage
        this.perPage = result.meta.perPage
        this.from = result.meta.from
        this.to = result.meta.to
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to load client bank details."
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(payload: ClientBankDetailPayload) {
      this.saving = true
      this.error = null

      try {
        return await clientBankDetailService.create(payload)
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to create client bank detail."
        throw error
      } finally {
        this.saving = false
      }
    },

    async update(id: number, payload: ClientBankDetailPayload) {
      this.saving = true
      this.error = null

      try {
        return await clientBankDetailService.update(id, payload)
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to update client bank detail."
        throw error
      } finally {
        this.saving = false
      }
    },

    async remove(id: number) {
      this.saving = true
      this.error = null

      try {
        await clientBankDetailService.remove(id)
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to delete client bank detail."
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
