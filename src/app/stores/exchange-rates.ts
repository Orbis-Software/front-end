import { defineStore } from "pinia"
import exchangeRateService from "@/app/services/exchange-rates"
import type {
  ExchangeRate,
  ExchangeRateFilters,
  ExchangeRatePayload,
} from "@/app/types/exchange-rate"

type State = {
  exchangeRates: ExchangeRate[]
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

export const useExchangeRateStore = defineStore("exchange-rates", {
  state: (): State => ({
    exchangeRates: [],
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
    upsertCached(exchangeRate: ExchangeRate) {
      const index = this.exchangeRates.findIndex(item => item.id === exchangeRate.id)

      if (index >= 0) {
        this.exchangeRates[index] = exchangeRate
      } else {
        this.exchangeRates.unshift(exchangeRate)
      }
    },

    async fetch(params: ExchangeRateFilters = {}) {
      this.loading = true
      this.error = null

      try {
        const result = await exchangeRateService.list(params)
        this.exchangeRates = result.exchangeRates
        this.total = result.meta.total
        this.filtered = result.meta.filtered
        this.currentPage = result.meta.currentPage
        this.lastPage = result.meta.lastPage
        this.perPage = result.meta.perPage
        this.from = result.meta.from
        this.to = result.meta.to
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to load exchange rates."
        throw error
      } finally {
        this.loading = false
      }
    },

    async create(payload: ExchangeRatePayload) {
      this.saving = true
      this.error = null

      try {
        const exchangeRate = await exchangeRateService.create(payload)
        this.upsertCached(exchangeRate)
        this.total += 1
        this.filtered += 1

        return exchangeRate
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to create exchange rate."
        throw error
      } finally {
        this.saving = false
      }
    },

    async update(id: number, payload: ExchangeRatePayload) {
      this.saving = true
      this.error = null

      try {
        const exchangeRate = await exchangeRateService.update(id, payload)
        this.upsertCached(exchangeRate)

        return exchangeRate
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to update exchange rate."
        throw error
      } finally {
        this.saving = false
      }
    },

    async remove(id: number) {
      this.saving = true
      this.error = null

      try {
        await exchangeRateService.remove(id)
        const before = this.exchangeRates.length
        this.exchangeRates = this.exchangeRates.filter(item => item.id !== id)

        if (this.exchangeRates.length !== before) {
          this.total = Math.max(0, this.total - 1)
          this.filtered = Math.max(0, this.filtered - 1)
        }
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to delete exchange rate."
        throw error
      } finally {
        this.saving = false
      }
    },

    async reset() {
      this.saving = true
      this.error = null

      try {
        this.exchangeRates = await exchangeRateService.reset()
      } catch (error: any) {
        this.error =
          error?.response?.data?.message || error?.message || "Failed to reset exchange rates."
        throw error
      } finally {
        this.saving = false
      }
    },
  },
})
