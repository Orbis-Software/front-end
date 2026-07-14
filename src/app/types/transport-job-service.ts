import type { JobType, JobInvoiceSummary, TransportMode } from "@/app/types/transport-job"

export type TransportJobFormValue = string | number | boolean | null | undefined

export interface CollectionNotePreviewPayload {
  order_reference?: string
  collection_ref?: string
  delivery_ref?: string
  pickup_date?: string | Date | null
  pickup_time?: string | null
  goods_description?: string | null
  billing_account?: string | null
  special_instructions?: string | null
  agreed_rate?: string | number | null
  fsc_percent?: string | number | null
  additional_costs?: string | number | null
  total?: string | number | null
  carrier_name?: string | null
  booking_ref?: string | null

  collection_address?: Record<string, any> | null
  delivery_address?: Record<string, any> | null

  items?: Array<{
    description?: string | null
    length_cm?: number | null
    width_cm?: number | null
    height_cm?: number | null
    qty?: number | null
    gross_kg?: number | null
  }>
}

export type EmailJobInvoicePayload = {
  invoiceId: number
  recipients: string[]
  subject: string
  body: string
}

export type JobPdfDocument =
  | "job_details"
  | "collection_order"
  | "transport_order"
  | "invoice"
  | "job_financials"
  | "supplier_invoice"

export type JobPdfOptions = {
  supplierId?: number | null
}

export interface ListTransportJobsParams {
  page?: number
  per_page?: number

  customer_id?: number
  mode_of_transport?: TransportMode
  job_type?: JobType
  status?: string
  q?: string
  created_by?: number
}

export type PassSupplierInvoicePayload = {
  supplier_id: number
  date_passed: string
  currency: string
  invoice_number: string
  invoice_date: string
  due_date: string
  invoice_amount: number
  tax_amount: number
  total_invoice_amount: number
  residual_amount: boolean
}

export type PassSupplierInvoiceResponse = JobInvoiceSummary
