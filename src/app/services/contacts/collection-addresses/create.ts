import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact, ContactCollectionAddressPayload } from "@/app/types/contact"

export default async function createCollectionAddress(
  contactId: number,
  payload: ContactCollectionAddressPayload,
): Promise<Contact> {
  const response = await http.post(`/contacts/${contactId}/collection-addresses`, payload)
  return contactTransformer.fetch(response.data)
}
