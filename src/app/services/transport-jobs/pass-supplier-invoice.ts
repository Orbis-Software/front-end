import http from "@/api/http"
import type { JobInvoiceSummary } from "@/app/types/transport-job"

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

export default async function passSupplierInvoice(
  id: number,
  payload: PassSupplierInvoicePayload,
): Promise<JobInvoiceSummary> {
  const response = await http.post(`/transport-jobs/${id}/supplier-invoices/pass`, payload)

  return response.data.data
}
