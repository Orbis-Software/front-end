import type { PaginatedSearchParams } from "@/app/types/pagination"

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

export type ListCountriesParams = PaginatedSearchParams
