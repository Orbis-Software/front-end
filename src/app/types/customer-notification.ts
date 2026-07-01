export interface CustomerNotification {
  id: string
  type: string
  title: string
  message: string
  url: string | null
  quote_id: number | null
  quote_ref: string | null
  invoice_id: number | null
  invoice_type: string | null
  transport_job_id: number | null
  read_at: string | null
  created_at: string | null
}
