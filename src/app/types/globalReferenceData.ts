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
  }
  counts: Record<string, number>
  filters: {
    types: string[]
    countries: string[]
    country_codes: string[]
    regions: string[]
    states: string[]
    statuses: string[]
    modes: string[]
  }
}
