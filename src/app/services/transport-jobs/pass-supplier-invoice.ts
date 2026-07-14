import http from "@/api/http"
import type {
  PassSupplierInvoicePayload,
  PassSupplierInvoiceResponse,
} from "@/app/types/transport-job-service"

export default async function passSupplierInvoice(
  id: number,
  payload: PassSupplierInvoicePayload,
): Promise<PassSupplierInvoiceResponse> {
  const response = await http.post(`/transport-jobs/${id}/supplier-invoices/pass`, payload)

  return response.data.data
}
