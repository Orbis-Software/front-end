import type { TableListFilters, TablePaginationMeta } from "@/app/types/pagination"

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

export type TaxCodeFilters = TableListFilters

export type TaxCodeMeta = TablePaginationMeta
