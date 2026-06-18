import { defineStore } from "pinia"
import chargeCodeService from "@/app/services/charge-codes"
import type {
  ChargeCode,
  ChargeCodeFilterOptions,
  ChargeCodeFilters,
  ChargeCodePayload,
} from "@/app/types/charge-code"

type State = {
  chargeCodes: ChargeCode[]
  filters: ChargeCodeFilterOptions
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

export const useChargeCodeStore = defineStore("charge-codes", {
  state: (): State => ({
    chargeCodes: [],
    filters: {
      classifications: [],
      purchaseNominals: [],
      salesNominals: [],
    },
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
    async fetch(params: ChargeCodeFilters = {}) {
      this.loading = true
      this.error = null

      try {
        const result = await chargeCodeService.list(params)
        this.chargeCodes = result.chargeCodes
        this.filters = result.meta.filters
        this.total = result.meta.total
        this.filtered = result.meta.filtered
        this.currentPage = result.meta.currentPage
        this.lastPage = result.meta.lastPage
        this.perPage = result.meta.perPage
        this.from = result.meta.from
        this.to = result.meta.to
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to load charge codes."
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAll(params: ChargeCodeFilters = {}) {
      this.loading = true
      this.error = null

      try {
        const perPage = params.perPage ?? 1000
        const firstResult = await chargeCodeService.list({
          ...params,
          page: 1,
          perPage,
        })
        const chargeCodes = [...firstResult.chargeCodes]

        for (let page = 2; page <= firstResult.meta.lastPage; page += 1) {
          const result = await chargeCodeService.list({
            ...params,
            page,
            perPage,
          })

          chargeCodes.push(...result.chargeCodes)
        }

        this.chargeCodes = chargeCodes
        this.filters = firstResult.meta.filters
        this.total = firstResult.meta.total
        this.filtered = firstResult.meta.filtered
        this.currentPage = 1
        this.lastPage = firstResult.meta.lastPage
        this.perPage = perPage
        this.from = chargeCodes.length ? 1 : null
        this.to = chargeCodes.length || null
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to load charge codes."
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(payload: ChargeCodePayload) {
      this.saving = true
      this.error = null

      try {
        const chargeCode = await chargeCodeService.create(payload)
        this.chargeCodes.unshift(chargeCode)
        this.total += 1
        this.filtered += 1
        return chargeCode
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to create charge code."
        throw error
      } finally {
        this.saving = false
      }
    },

    async update(id: number, payload: ChargeCodePayload) {
      this.saving = true
      this.error = null

      try {
        const chargeCode = await chargeCodeService.update(id, payload)
        const index = this.chargeCodes.findIndex(item => item.id === id)
        if (index >= 0) this.chargeCodes[index] = chargeCode
        return chargeCode
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to update charge code."
        throw error
      } finally {
        this.saving = false
      }
    },

    async remove(id: number) {
      this.saving = true
      this.error = null

      try {
        await chargeCodeService.remove(id)
        this.chargeCodes = this.chargeCodes.filter(item => item.id !== id)
        this.total = Math.max(0, this.total - 1)
        this.filtered = Math.max(0, this.filtered - 1)
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to delete charge code."
        throw error
      } finally {
        this.saving = false
      }
    },

    async reset() {
      this.saving = true
      this.error = null

      try {
        this.chargeCodes = await chargeCodeService.reset()
        this.total = this.chargeCodes.length
        this.filtered = this.chargeCodes.length
        this.currentPage = 1
        this.lastPage = 1
        this.from = this.chargeCodes.length ? 1 : null
        this.to = this.chargeCodes.length || null
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to reset charge codes."
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
