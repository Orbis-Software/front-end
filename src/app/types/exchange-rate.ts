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

export type ExchangeRateFilters = {
  search?: string
  sort?: string
  direction?: "asc" | "desc"
  page?: number
  perPage?: number
}

export type EffectiveExchangeRateParams = {
  base: string
  quote: string
  date: string
}

export type ExchangeRateMeta = {
  total: number
  filtered: number
  currentPage: number
  lastPage: number
  perPage: number
  from: number | null
  to: number | null
}
