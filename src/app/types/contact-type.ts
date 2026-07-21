import type { PaginatedSearchParams } from "@/app/types/pagination"

export interface ContactType {
  id: number
  code: string
  name: string
  created_at?: string
  updated_at?: string
}

export type ListContactTypesParams = PaginatedSearchParams
