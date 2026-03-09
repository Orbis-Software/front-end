import http from "@/api/http"
import contactChargeTableTransformer from "@/app/transformers/contact-charge-table"
import type { ContactChargeTable } from "@/app/types/contact"

export default async function showContactChargeTable(
  contactId: number,
  tableId: number,
): Promise<ContactChargeTable> {
  const response = await http.get(`/contacts/${contactId}/charge-tables/${tableId}`)
  return contactChargeTableTransformer.fetch(response.data)
}
