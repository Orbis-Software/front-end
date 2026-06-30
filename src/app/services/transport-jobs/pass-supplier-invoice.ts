import http from "@/api/http"
import type { JobInvoiceSummary } from "@/app/types/transport-job"

export type PassSupplierInvoicePayload = {
  supplier_id: number
  date_passed: string
  currency: string
  invoice_number: string
  invoice_date: string
  due_date: string
  net_amount: number
  tax_amount: number
  gross_amount: number
}

export default async function passSupplierInvoice(
  id: number,
  payload: PassSupplierInvoicePayload,
): Promise<JobInvoiceSummary> {
  const response = await http.post(`/transport-jobs/${id}/supplier-invoices/pass`, payload)

  return response.data.data
}
