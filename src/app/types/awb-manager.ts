export type AwbStatus = "available" | "reserved" | "used" | "voided"

export interface AwbStock {
  id: number

  companyId?: number
  company_id?: number

  awbAirlineId?: number
  awb_airline_id: number

  transportJobId?: number | null
  transport_job_id: number | null

  awbNumber?: string
  awb_number: string

  number: string

  serialNumber?: string | null
  serial_number: string | null

  status: AwbStatus
  statusLabel?: string

  jobNumber: string | null

  transportJob?: {
    id: number
    jobNumber?: string
    job_number?: string
  } | null

  transport_job?: {
    id: number
    job_number: string
  } | null

  reservedAt?: string | null
  reserved_at: string | null

  usedAt?: string | null
  used_at: string | null

  voidedAt?: string | null
  voided_at: string | null

  dateUsed: string | null
  date_used: string | null

  notes: string | null

  assignmentNotes?: string | null
  assignment_notes: string | null

  assignNotes: string | null

  createdAt?: string
  created_at: string

  updatedAt?: string
  updated_at: string
}

export interface AwbAirline {
  id: number

  companyId?: number
  company_id: number

  name: string
  code: string | null
  prefix: string

  contract: string | null

  contractRef?: string | null
  contract_ref: string | null

  notes: string | null

  isActive?: boolean
  is_active: boolean

  awbs: AwbStock[]
  awb_stocks?: AwbStock[]

  collapsed: boolean

  createdAt?: string
  created_at: string

  updatedAt?: string
  updated_at: string
}

export interface AwbSummary {
  airlines: number
  total: number
  available: number
  used: number
  reserved: number
  voided: number
}

/**
 * Matches StoreAwbAirlineRequest / UpdateAwbAirlineRequest
 */
export interface AwbAirlinePayload {
  name: string
  code?: string | null
  prefix: string
  contract_ref?: string | null
  contractRef?: string | null
  notes?: string | null
  is_active?: boolean
}

/**
 * Matches StoreSingleAwbRequest
 */
export interface SingleAwbPayload {
  number: string
  status?: "available" | "reserved"
  notes?: string | null
}

/**
 * Matches StoreRangeAwbRequest
 */
export interface RangeAwbPayload {
  from: number
  to: number
}

/**
 * Matches StoreBulkAwbRequest
 */
export interface BulkAwbPayload {
  numbers: string[]
}

/**
 * Matches AssignAwbRequest
 */
export interface AssignAwbPayload {
  transport_job_id: number
  date_used: string
  notes?: string | null
}
