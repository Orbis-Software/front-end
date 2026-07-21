import type { TableListFilters, TablePaginationMeta } from "@/app/types/pagination"

export type ExchangeRate = {
  id: number
  base: string
  quote: string
  rate: number
  effectiveDate: string
  isActive: boolean
  requestedDate?: string
  isInverse?: boolean
  sourceBase?: string
  sourceQuote?: string
  sourceRate?: number
}

export type ExchangeRatePayload = {
  base: string
  quote: string
  rate: number
  effectiveDate: string
  isActive?: boolean
}

export type ExchangeRateFilters = TableListFilters

export type EffectiveExchangeRateParams = {
  base: string
  quote: string
  date: string
}

export type ExchangeRateMeta = TablePaginationMeta
