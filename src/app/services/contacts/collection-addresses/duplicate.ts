import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact } from "@/app/types/contact"

export default async function duplicateCollectionAddress(
  contactId: number,
  addressId: number,
): Promise<Contact> {
  const response = await http.post(
    `/contacts/${contactId}/collection-addresses/${addressId}/duplicate`,
  )

  return contactTransformer.fetch(response.data)
}
