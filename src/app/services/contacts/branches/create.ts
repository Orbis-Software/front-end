import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact, ContactBranchPayload } from "@/app/types/contact"

export default async function createBranch(
  contactId: number,
  payload: ContactBranchPayload,
): Promise<Contact> {
  const response = await http.post(`/contacts/${contactId}/branches`, payload)
  return contactTransformer.fetch(response.data)
}
