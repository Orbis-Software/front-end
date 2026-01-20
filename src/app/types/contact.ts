import type { ContactPerson } from '@/app/types/contact-person'

export type ContactType =
  | 'customer'
  | 'supplier'
  | 'road_haulier'
  | 'airline'
  | 'rail_operator'
  | 'shipping_line'

export interface Contact {
  id: number
  company_id: number
  contact_type: ContactType
  address: string | null
  country: string | null
  eori: string | null
  credit_limit: number | null
  currency_preference: string | null
  status: string
  people: ContactPerson[]  
  created_at: string
  updated_at: string
}

export interface ContactCreatePayload {
  contact_type: ContactType
  address?: string | null
  country?: string | null
  eori?: string | null
  credit_limit?: number | null
  currency_preference?: string | null
  status?: string
}

export interface ContactUpdatePayload extends Partial<ContactCreatePayload> {}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta?: PaginationMeta
  links?: any
}
