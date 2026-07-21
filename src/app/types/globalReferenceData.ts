import type { TableColumn } from "@/app/types/table"

export type GlobalReferenceDataTabValue = "locations" | "terminals" | "airlines" | "cities"

export type GlobalReferenceDataRow = Record<string, string>

export type GlobalReferenceDataSet = Record<GlobalReferenceDataTabValue, GlobalReferenceDataRow[]>

export type GlobalReferenceDataListParams = {
  category?: string
  type?: string
  country?: string
  country_code?: string
  region?: string
  state?: string
  status?: string
  mode?: "road" | "rail" | "sea" | "air"
  modes?: Array<"road" | "rail" | "sea" | "air">
  search?: string
  sort?: string
  direction?: "asc" | "desc"
  page?: number
  per_page?: number
  compact?: boolean
}

export type GlobalReferenceDataListResponse = {
  rows: GlobalReferenceDataRow[]
  meta: {
    current_page: number
    from: number | null
    last_page: number
    per_page: number
    to: number | null
    total: number
    unfiltered_total: number
    countries_total: number
    generated_date: string
  }
  counts: Record<string, number>
  filters: {
    types: string[]
    countries: string[]
    country_options: GlobalReferenceCountryOption[]
    country_codes: string[]
    regions: string[]
    states: string[]
    statuses: string[]
    modes: string[]
  }
}

export type GlobalReferenceCountryOption = {
  name: string
  code: string
  region: string
}

export type DeliveryLocationPayload = {
  city: string
  country: string
  country_code: string
  code?: string
  state?: string
  region?: string
  latitude?: number | null
  longitude?: number | null
  timezone?: string
  road: boolean
  rail: boolean
  sea: boolean
  air: boolean
}

export type DeliveryLocationUpdate = {
  id: number
  code: string
  state: string
}

export type GlobalReferenceDataCategoryValue = GlobalReferenceDataTabValue | ""

export type GlobalReferenceDataColumn = TableColumn

export type GlobalReferenceDataCategoryOption = {
  label: string
  value: GlobalReferenceDataCategoryValue
  count: number
}
