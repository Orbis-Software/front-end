export type PaginationMeta = {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type PaginationLinks = {
  first?: string | null
  last?: string | null
  prev?: string | null
  next?: string | null
}

export type PaginatedResponse<T> = {
  data: T[]
  meta?: PaginationMeta
  links?: PaginationLinks
}

export type TablePaginationMeta = {
  total: number
  filtered: number
  currentPage: number
  lastPage: number
  perPage: number
  from: number | null
  to: number | null
}

export type TableListFilters = {
  search?: string
  sort?: string
  direction?: "asc" | "desc"
  page?: number
  perPage?: number
}

export type PaginatedSearchParams = {
  page?: number
  per_page?: number
  q?: string
}
