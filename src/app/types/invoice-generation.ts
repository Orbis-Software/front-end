export type InvoiceGenerationStatus = "pending" | "queued" | "processing" | "completed" | "failed"

export type InvoiceGenerationTask = {
  id: string
  invoice_id: number | null
  transport_job_id: number
  job_number?: string | null
  invoice_type: "customer" | "supplier"
  invoice_number?: string | null
  generation_status: InvoiceGenerationStatus
  status: InvoiceGenerationStatus
  stage: string
  stage_message: string
  progress: number
  download_available: boolean
  started_at?: string | null
  completed_at?: string | null
  failed_at?: string | null
  error_message?: string | null
}

export type InvoiceGenerationResponse = {
  message?: string
  invoice_id: number
  generation_status: InvoiceGenerationStatus
  download_available?: boolean
  generation?: InvoiceGenerationTask
  data?: any
}

export type InvoiceGenerationStatusResponse = InvoiceGenerationTask
