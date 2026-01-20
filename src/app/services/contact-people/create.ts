/**
 * =====================
 * Create Contact Person
 * =====================
 */

import http from '@/api/http'
import contactPersonTransformer from '@/app/transformers/contact-person'
import type { ContactPerson, ContactPersonCreatePayload } from '@/app/types/contact-person'

export default async function create(payload: ContactPersonCreatePayload): Promise<ContactPerson> {
  const response = await http.post('/contact-people', payload)
  return contactPersonTransformer.fetch(response.data)
}
