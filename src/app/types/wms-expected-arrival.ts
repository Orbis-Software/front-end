export type WmsExpectedArrivalStatus = "expected" | "delayed" | "booked_in"

export interface WmsExpectedArrivalLine {
  id: number
  source_package_id: number | null
  package_type: string | null
  description: string | null
  quantity: number
  weight_kg: string | null
  volume_cbm: string | null
  length_cm: string | null
  width_cm: string | null
  height_cm: string | null
  hazardous: boolean
  adr_class: string | null
  status: WmsExpectedArrivalStatus
}

export interface WmsExpectedArrival {
  id: number
  transport_job_id: number | null
  customer_id: number | null
  source_type: "manual" | "collection_order"
  source_order_id: string | null
  collection_order_ref: string | null
  wms_reference: string
  job_number: string | null
  customer_reference: string | null
  customer_name: string
  supplier_name: string | null
  description: string | null
  expected_date: string | null
  expected_time: string | null
  estimated_quantity: number
  status: WmsExpectedArrivalStatus
  external_reference: string | null
  receipt_reference: string | null
  storage_location: string | null
  received_by_user_id: number | null
  received_by_name: string | null
  received_quantity: number | null
  received_weight_kg: string | null
  received_volume_cbm: string | null
  notes: string | null
  received_at: string | null
  is_source_locked: boolean
  lines: WmsExpectedArrivalLine[]
  created_at: string | null
  updated_at: string | null
}

export interface WmsExpectedArrivalCreatePayload {
  customer_id?: number | null
  customer_name: string
  supplier_name?: string | null
  description: string
  expected_date?: string | null
  expected_time?: string | null
  estimated_quantity?: number | null
  status?: WmsExpectedArrivalStatus
  external_reference?: string | null
  notes?: string | null
}

export interface WmsExpectedArrivalReceivePayload {
  storage_location?: string | null
  received_by_name?: string | null
  received_quantity: number
  received_weight_kg?: number | null
  received_volume_cbm?: number | null
  notes?: string | null
}

export interface WmsExpectedArrivalListResponse {
  data: WmsExpectedArrival[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}
