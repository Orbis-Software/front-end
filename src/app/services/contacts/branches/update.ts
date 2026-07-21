import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact, ContactBranchPayload } from "@/app/types/contact"

export default async function updateBranch(
  contactId: number,
  branchId: number,
  payload: ContactBranchPayload,
): Promise<Contact> {
  const response = await http.patch(`/contacts/${contactId}/branches/${branchId}`, payload)
  return contactTransformer.fetch(response.data)
}
