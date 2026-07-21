import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact, ContactCollectionAddressPayload } from "@/app/types/contact"

export default async function updateCollectionAddress(
  contactId: number,
  addressId: number,
  payload: ContactCollectionAddressPayload,
): Promise<Contact> {
  const response = await http.patch(
    `/contacts/${contactId}/collection-addresses/${addressId}`,
    payload,
  )
  return contactTransformer.fetch(response.data)
}
