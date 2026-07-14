import http from "@/api/http"
import type {
  InvoiceGenerationResponse,
  InvoiceGenerationStatusResponse,
  InvoiceGenerationTask,
} from "@/app/types/invoice-generation"

export async function generateCustomerInvoice(id: number): Promise<InvoiceGenerationResponse> {
  const response = await http.post(`/transport-jobs/${id}/customer-invoices/generate`)

  return response.data
}

export async function generateSupplierInvoice(
  id: number,
  supplierId: number,
  payload: {
    reference?: string
    invoice_number?: string
    invoice_date?: string
    due_date?: string
    date_passed?: string
    currency?: string
    invoice_amount?: number
    tax_amount?: number
    total_invoice_amount?: number
    residual_amount?: boolean
  } = {},
): Promise<InvoiceGenerationResponse> {
  const response = await http.post(`/transport-jobs/${id}/supplier-invoices/generate`, {
    supplier_id: supplierId,
    ...payload,
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

export async function deleteInvoice(
  id: number,
  invoiceId: number,
  confirmation: string,
): Promise<void> {
  await http.delete(`/transport-jobs/${id}/invoices/${invoiceId}`, {
    data: { confirmation },
  })
}
