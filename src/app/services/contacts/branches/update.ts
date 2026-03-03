import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact, ContactBranch } from "@/app/types/contact"

type Payload = Partial<Omit<ContactBranch, "id">>

export default async function updateBranch(
  contactId: number,
  branchId: number,
  payload: Payload
): Promise<Contact> {
  const response = await http.patch(`/contacts/${contactId}/branches/${branchId}`, payload)
  return contactTransformer.fetch(response.data)
}