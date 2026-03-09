import type { Contact } from "@/app/types/contact"
import type { JobFile } from "@/app/types/job-file"

/**
 * ✅ Updated enums:
 * - Added "consolidation" to TransportMode
 * - Added "multi_modal" to JobType
 */
export type TransportMode = "air" | "sea" | "road" | "rail" | "consolidation"
export type JobType = "import" | "export" | "cross_trade" | "domestic" | "multi_modal"

export interface TransportJob {
  id: number
  company_id: number

  customer_id?: number | null

  // ✅ API returns this (currently null in your example, but exists)
  account_number?: string | null

  quote_ref?: string | null
  job_number: string
  job_date?: string | null

  /**
   * ✅ Multi Modal: mode_of_transport can be null
   * (because UI won't select a mode for multi_modal)
   */
  mode_of_transport: TransportMode | null
  job_type: JobType

  note?: string | null

  // relations (because your API loads: files + customer_contact)
  customer_contact?: Contact | null
  files: JobFile[]

  created_at?: string
  updated_at?: string
  deleted_at?: string | null
}

/** Shared base fields */
export interface BaseTransportJobCreatePayload {
  customer_id?: number | null

  quote_ref?: string | null
  job_number: string
  job_date?: string | null

  note?: string | null

  // uploads (same as your request rules)
  files?: File[]
  file_types?: (string | null)[]
}

/**
 * ✅ Discriminated union payload:
 * - If job_type = multi_modal => mode_of_transport must be null
 * - Otherwise => mode_of_transport is required
 */
export type TransportJobCreatePayload =
  | (BaseTransportJobCreatePayload & {
      job_type: "multi_modal"
      mode_of_transport: null
    })
  | (BaseTransportJobCreatePayload & {
      job_type: Exclude<JobType, "multi_modal">
      mode_of_transport: TransportMode
    })

export interface TransportJobUpdatePayload extends Partial<BaseTransportJobCreatePayload> {
  /**
   * Updates can optionally pass mode_of_transport.
   * If job_type is changed to multi_modal, backend should accept null.
   */
  job_type?: JobType
  mode_of_transport?: TransportMode | null
}

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