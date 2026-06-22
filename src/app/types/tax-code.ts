export type TaxCode = {
  id: number
  country: string
  code: string
  taxCode: string
  rate: number
  description: string
  calculationType: "percentage" | "withholding_tax"
  backCalculatedRate: number | null
  isActive: boolean
}

export type TaxCodePayload = {
  country: string
  code: string
  taxCode: string
  rate: number
  description?: string
  calculationType?: "percentage" | "withholding_tax"
  backCalculatedRate?: number | null
  isActive?: boolean
}

export type TaxCodeFilters = {
  search?: string
  sort?: string
  direction?: "asc" | "desc"
  page?: number
  perPage?: number
}

export type TaxCodeMeta = {
  total: number
  filtered: number
  currentPage: number
  lastPage: number
  perPage: number
  from: number | null
  to: number | null
}
