import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact } from "@/app/types/contact"

export default async function removeCollectionAddress(
  contactId: number,
  addressId: number,
): Promise<Contact> {
  const response = await http.delete(`/contacts/${contactId}/collection-addresses/${addressId}`)
  return contactTransformer.fetch(response.data)
}
