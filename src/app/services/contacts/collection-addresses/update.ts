import http from "@/api/http"
import contactTransformer from "@/app/transformers/contact"
import type { Contact, ContactCollectionAddress } from "@/app/types/contact"

type Payload = Partial<Omit<ContactCollectionAddress, "id">>

export default async function updateCollectionAddress(
  contactId: number,
  addressId: number,
  payload: Payload
): Promise<Contact> {
  const response = await http.patch(
    `/contacts/${contactId}/collection-addresses/${addressId}`,
    payload
  )
  return contactTransformer.fetch(response.data)
}