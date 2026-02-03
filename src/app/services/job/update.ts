/**
 * =================
 * Update Contact
 * =================
 */

import http from '@/api/http'
import contactTransformer from '@/app/transformers/contact'
import type { Contact, ContactUpdatePayload } from '@/app/types/contact'

export default async function updateContact(
  id: number,
  payload: ContactUpdatePayload
): Promise<Contact> {
  const response = await http.put(`/contacts/${id}`, payload)
  return contactTransformer.fetch(response.data)
}
