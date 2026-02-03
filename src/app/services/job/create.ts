/**
 * =================
 * Create Contact
 * =================
 */

import http from '@/api/http'
import contactTransformer from '@/app/transformers/contact'
import type { Contact, ContactCreatePayload } from '@/app/types/contact'

export default async function createContact(
  payload: ContactCreatePayload
): Promise<Contact> {
  const response = await http.post('/contacts', payload)
  return contactTransformer.fetch(response.data)
}
