import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact } from "@/app/types/contact"

export default async function removeBranch(contactId: number, branchId: number): Promise<Contact> {
  const response = await http.delete(`/contacts/${contactId}/branches/${branchId}`)
  return contactTransformer.fetch(response.data)
}
