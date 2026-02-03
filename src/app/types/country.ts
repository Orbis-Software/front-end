export type Country = {
  id: number
  alpha_2: string
  alpha_3: string
  name: string
  dial_code: string
  min: number
  max: number
  created_at?: string
  updated_at?: string
}

export type PaginationMeta = {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export type PaginatedResponse<T> = {
  data: T[]
  meta?: PaginationMeta
}
