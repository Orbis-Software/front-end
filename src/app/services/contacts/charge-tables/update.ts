import http from "@/api/http"
import contactChargeTableTransformer from "@/app/transformers/contact-charge-table"
import type { ContactChargeTable, ContactChargeTablePayload } from "@/app/types/contact"

export default async function updateContactChargeTable(
  contactId: number,
  tableId: number,
  payload: Partial<ContactChargeTablePayload>,
): Promise<ContactChargeTable> {
  const response = await http.patch(`/contacts/${contactId}/charge-tables/${tableId}`, payload)

  return contactChargeTableTransformer.fetch(response.data)
}
