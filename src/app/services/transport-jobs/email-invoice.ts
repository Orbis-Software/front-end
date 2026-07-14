import http from "@/api/http"
import type { EmailJobInvoicePayload } from "@/app/types/transport-job-service"

export default async function emailInvoice(
  id: number,
  payload: EmailJobInvoicePayload,
): Promise<void> {
  await http.post(`/transport-jobs/${id}/invoice-email`, {
    invoice_id: payload.invoiceId,
    recipients: payload.recipients,
    subject: payload.subject,
    body: payload.body,
  })
}
