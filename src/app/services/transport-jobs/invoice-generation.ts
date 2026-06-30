import http from "@/api/http"

export type InvoiceGenerationStatus = "pending" | "queued" | "processing" | "completed" | "failed"

export type InvoiceGenerationResponse = {
  message?: string
  invoice_id: number
  generation_status: InvoiceGenerationStatus
  download_available?: boolean
  generation?: InvoiceGenerationTask
  data?: any
}

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

export type InvoiceGenerationStatusResponse = InvoiceGenerationTask

export async function generateCustomerInvoice(id: number): Promise<InvoiceGenerationResponse> {
  const response = await http.post(`/transport-jobs/${id}/customer-invoices/generate`)

  return response.data
}

export async function generateSupplierInvoice(
  id: number,
  supplierId: number,
): Promise<InvoiceGenerationResponse> {
  const response = await http.post(`/transport-jobs/${id}/supplier-invoices/generate`, {
    supplier_id: supplierId,
  })

  return response.data
}

export async function invoiceGenerationStatus(
  id: number,
  invoiceId: number,
): Promise<InvoiceGenerationStatusResponse> {
  const response = await http.get(`/transport-jobs/${id}/invoices/${invoiceId}/generation-status`)

  return response.data.data
}

export async function invoiceGenerationTask(uuid: string): Promise<InvoiceGenerationTask> {
  const response = await http.get(`/invoice-generations/${uuid}`)

  return response.data.data
}

export async function downloadInvoicePdf(id: number, invoiceId: number): Promise<Blob> {
  const response = await http.get(`/transport-jobs/${id}/invoices/${invoiceId}/download`, {
    responseType: "blob",
    headers: {
      Accept: "application/pdf",
    },
  })

  return response.data
}
