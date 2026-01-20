/**
 * =================
 * Remove Contact
 * =================
 */

import http from '@/api/http'

export default async function removeContact(id: number): Promise<void> {
  await http.delete(`/contacts/${id}`)
}
