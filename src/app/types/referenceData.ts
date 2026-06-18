export interface ReferenceDataOption {
  id: number
  reference_data_category_id?: number
  name: string
  metadata?: Record<string, unknown> | null
  is_default: boolean
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ReferenceDataCategory {
  id: number
  key: string
  group: string
  label: string
  icon: string | null
  icon_bg: string | null
  icon_color: string | null
  sort_order: number
  is_active: boolean
  options: ReferenceDataOption[]
  created_at?: string
  updated_at?: string
}

export type CreateReferenceDataOptionPayload = {
  name?: string
  is_default?: boolean
  metadata?: Record<string, unknown> | null
}
