import type { Contact } from "@/app/types/contact"
import type { JobFile } from "@/app/types/job-file"

/**
 * Updated enums:
 * - Added "consolidation" to JobType
 * - Multi Modal and Consolidation do not require a mode
 */
export type JobType = "import" | "export" | "domestic" | "courier" | "multi_modal" | "consolidation"

export type TransportMode = "air" | "rail" | "road" | "sea"

export interface TransportJobCreator {
  id: number
  name: string | null
  email: string | null
}

export interface TransportJob {
  id: number
  company_id: number

  created_by?: number | null
  creator?: TransportJobCreator | null

  customer_id?: number | null
  account_number?: string | null

  quote_ref?: string | null
  job_number: string
  job_date?: string | null

  /**
   * Multi Modal and Consolidation can have null mode_of_transport
   */
  mode_of_transport: TransportMode | null
  job_type: JobType

  note?: string | null

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

  files?: File[]
  file_types?: (string | null)[]
}

/**
 * Create payload rules:
 * - multi_modal => mode_of_transport must be null
 * - consolidation => mode_of_transport must be null
 * - all others => mode_of_transport is required
 */
export type TransportJobCreatePayload =
  | (BaseTransportJobCreatePayload & {
      job_type: "multi_modal"
      mode_of_transport: null
    })
  | (BaseTransportJobCreatePayload & {
      job_type: "consolidation"
      mode_of_transport: null
    })
  | (BaseTransportJobCreatePayload & {
      job_type: Exclude<JobType, "multi_modal" | "consolidation">
      mode_of_transport: TransportMode
    })

export interface TransportJobUpdatePayload extends Partial<BaseTransportJobCreatePayload> {
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
