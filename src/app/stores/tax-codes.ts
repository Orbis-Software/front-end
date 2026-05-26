import { defineStore } from "pinia"
import taxCodeService from "@/app/services/tax-codes"
import type { TaxCode, TaxCodeFilters, TaxCodePayload } from "@/app/types/tax-code"

type State = {
  taxCodes: TaxCode[]
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

export const useTaxCodeStore = defineStore("tax-codes", {
  state: (): State => ({
    taxCodes: [],
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
    async fetch(params: TaxCodeFilters = {}) {
      this.loading = true
      this.error = null

      try {
        const result = await taxCodeService.list(params)
        this.taxCodes = result.taxCodes
        this.total = result.meta.total
        this.filtered = result.meta.filtered
        this.currentPage = result.meta.currentPage
        this.lastPage = result.meta.lastPage
        this.perPage = result.meta.perPage
        this.from = result.meta.from
        this.to = result.meta.to
      } catch (error: any) {
        this.error = error?.response?.data?.message || error?.message || "Failed to load tax codes."
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(payload: TaxCodePayload) {
      this.saving = true
      this.error = null

      try {
        return await taxCodeService.create(payload)
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to create tax code."
        throw error
      } finally {
        this.saving = false
      }
    },

    async update(id: number, payload: TaxCodePayload) {
      this.saving = true
      this.error = null

      try {
        return await taxCodeService.update(id, payload)
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to update tax code."
        throw error
      } finally {
        this.saving = false
      }
    },

    async remove(id: number) {
      this.saving = true
      this.error = null

      try {
        await taxCodeService.remove(id)
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to delete tax code."
        throw error
      } finally {
        this.saving = false
      }
    },

    async reset() {
      this.saving = true
      this.error = null

      try {
        this.taxCodes = await taxCodeService.reset()
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to reset tax codes."
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
