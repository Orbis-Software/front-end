import { defineStore } from "pinia"
import exchangeRateService from "@/app/services/exchange-rates"
import type {
  EffectiveExchangeRateParams,
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
  effectiveRates: Record<string, ExchangeRate | null>
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
    effectiveRates: {},
  }),

  actions: {
    effectiveKey(params: EffectiveExchangeRateParams) {
      return [
        String(params.base || "").toUpperCase(),
        String(params.quote || "").toUpperCase(),
        params.date,
      ].join(":")
    },

    upsertCached(exchangeRate: ExchangeRate) {
      const index = this.exchangeRates.findIndex(item => item.id === exchangeRate.id)

      if (index >= 0) {
        this.exchangeRates[index] = exchangeRate
      } else {
        this.exchangeRates.unshift(exchangeRate)
      }
    },

    async fetchEffective(params: EffectiveExchangeRateParams) {
      const normalizedParams = {
        base: String(params.base || "").toUpperCase(),
        quote: String(params.quote || "").toUpperCase(),
        date: params.date,
      }
      const key = this.effectiveKey(normalizedParams)

      if (Object.prototype.hasOwnProperty.call(this.effectiveRates, key)) {
        return this.effectiveRates[key]
      }

      if (normalizedParams.base === normalizedParams.quote) {
        const sameCurrencyRate: ExchangeRate = {
          id: 0,
          base: normalizedParams.base,
          quote: normalizedParams.quote,
          rate: 1,
          effectiveDate: normalizedParams.date,
          requestedDate: normalizedParams.date,
          isActive: true,
        }

        this.effectiveRates[key] = sameCurrencyRate

        return sameCurrencyRate
      }

      try {
        const exchangeRate = await exchangeRateService.effective(normalizedParams)
        this.effectiveRates[key] = exchangeRate

        return exchangeRate
      } catch (error: any) {
        this.effectiveRates[key] = null
        this.error =
          error?.response?.data?.message || error?.message || "Failed to load exchange rate."
        throw error
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
        this.effectiveRates = {}
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
        this.effectiveRates = {}

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
        this.effectiveRates = {}
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
        this.effectiveRates = {}
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
