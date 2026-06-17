export type GlobalReferenceDataTabValue = "terminals" | "airlines" | "cities"

export type GlobalReferenceDataRow = Record<string, string>

export type GlobalReferenceDataSet = Record<GlobalReferenceDataTabValue, GlobalReferenceDataRow[]>

export type GlobalReferenceDataListParams = {
  category?: string
  type?: string
  country?: string
  region?: string
  status?: string
  search?: string
  sort?: string
  direction?: "asc" | "desc"
  page?: number
  per_page?: number
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
    regions: string[]
    statuses: string[]
  }
}
