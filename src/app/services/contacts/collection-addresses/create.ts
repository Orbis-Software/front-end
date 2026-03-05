import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact, ContactCollectionAddress } from "@/app/types/contact"

type Payload = Partial<Omit<ContactCollectionAddress, "id">>

export default async function createCollectionAddress(
  contactId: number,
  payload: Payload,
): Promise<Contact> {
  const response = await http.post(`/contacts/${contactId}/collection-addresses`, payload)
  return contactTransformer.fetch(response.data)
}
