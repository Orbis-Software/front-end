import { defineStore } from "pinia"
import transportQuoteService from "@/app/services/quotes"
import type {
  ConvertQuoteToJobPayload,
  TransportQuote,
  TransportQuoteFilters,
  TransportQuotePayload,
} from "@/app/types/transportQuote"

export const useTransportQuoteStore = defineStore("transportQuote", {
  state: () => ({
    quotes: [] as TransportQuote[],
    selectedQuote: null as TransportQuote | null,

    loading: false,
    saving: false,
    converting: false,

    error: null as string | null,
    meta: null as any | null,
    links: null as any | null,

    filters: {
      page: 1,
      per_page: 15,
      q: null,
      customer_id: null,
      quote_type: null,
      mode_of_transport: null,
      status: null,
    } as TransportQuoteFilters,
  }),

  actions: {
    async fetchQuotes(filters: Partial<TransportQuoteFilters> = {}) {
      this.loading = true
      this.error = null

      try {
        this.filters = {
          ...this.filters,
          ...filters,
        }

        const result = await transportQuoteService.list(this.filters)

        this.quotes = result.data
        this.meta = result.meta
        this.links = result.links

        return result
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? "Failed to load transport quotes."
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchQuote(id: number) {
      this.loading = true
      this.error = null

      try {
        const quote = await transportQuoteService.show(id)

        this.selectedQuote = quote

        return quote
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? "Failed to load transport quote."
        throw error
      } finally {
        this.loading = false
      }
    },

    async createQuote(payload: TransportQuotePayload) {
      this.saving = true
      this.error = null

      try {
        const quote = await transportQuoteService.create(payload)

        this.quotes.unshift(quote)
        this.selectedQuote = quote

        return quote
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? "Failed to create transport quote."
        throw error
      } finally {
        this.saving = false
      }
    },

    async updateQuote(id: number, payload: TransportQuotePayload) {
      this.saving = true
      this.error = null

      try {
        const quote = await transportQuoteService.update(id, payload)

        const index = this.quotes.findIndex(item => item.id === id)

        if (index !== -1) {
          this.quotes[index] = quote
        }

        this.selectedQuote = quote

        return quote
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? "Failed to update transport quote."
        throw error
      } finally {
        this.saving = false
      }
    },

    async deleteQuote(id: number) {
      this.saving = true
      this.error = null

      try {
        await transportQuoteService.remove(id)

        this.quotes = this.quotes.filter(item => item.id !== id)

        if (this.selectedQuote?.id === id) {
          this.selectedQuote = null
        }

        return true
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? "Failed to delete transport quote."
        throw error
      } finally {
        this.saving = false
      }
    },

    async convertQuoteToJob(id: number, payload: ConvertQuoteToJobPayload = {}) {
      this.converting = true
      this.error = null

      try {
        const job = await transportQuoteService.convertToJob(id, payload)

        await this.fetchQuote(id)

        return job
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? "Failed to convert quote to job."
        throw error
      } finally {
        this.converting = false
      }
    },

    async quotePdf(id: number): Promise<Blob> {
      this.error = null

      try {
        return await transportQuoteService.pdf(id)
      } catch (error: any) {
        this.error = error?.response?.data?.message ?? "Failed to generate quote PDF."
        throw error
      }
    },

    resetSelectedQuote() {
      this.selectedQuote = null
    },
  },
})
