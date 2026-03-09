import http from "@/api/http"
import type { ContactChargeTable, ContactChargeTablePayload } from "@/app/types/contact"

export default async function createContactChargeTable(
  contactId: number,
  payload: ContactChargeTablePayload,
): Promise<ContactChargeTable> {
  const response = await http.post(`/contacts/${contactId}/charge-tables`, payload)
  return response.data
}
