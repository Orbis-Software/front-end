export type ChargeCode = {
  id: number
  companyId: number | null
  description: string
  purchaseNominal: string
  salesNominal: string
  classification: string
  defaultTaxCode: string
  isCustoms: boolean
  isActive: boolean
  createdAt: string | null
  updatedAt: string | null
}

export type ChargeCodePayload = {
  description: string
  purchaseNominal?: string
  salesNominal?: string
  classification?: string
  defaultTaxCode?: string
  isCustoms?: boolean
  isActive?: boolean
}

export type ChargeCodeFilters = {
  search?: string
  classification?: string
  purchaseNominal?: string
  salesNominal?: string
  isCustoms?: string
  sort?: string
  direction?: "asc" | "desc"
  page?: number
  perPage?: number
}

export type ChargeCodeFilterOptions = {
  classifications: string[]
  purchaseNominals: string[]
  salesNominals: string[]
}

export type ChargeCodeMeta = {
  total: number
  filtered: number
  currentPage: number
  lastPage: number
  perPage: number
  from: number | null
  to: number | null
  filters: ChargeCodeFilterOptions
}
