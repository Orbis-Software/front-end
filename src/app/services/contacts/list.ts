import http from '@/api/http'
import contactTransformer from '@/app/transformers/contact'
import type { Contact, PaginatedResponse } from '@/app/types/contact'

export interface ListContactsParams {
  page?: number
  per_page?: number
  contact_type_id?: number
  status?: string
  q?: string
}

export default async function listContacts(
  params: ListContactsParams = {}
): Promise<PaginatedResponse<Contact>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )

  const response = await http.get('/contacts', { params: cleanParams })

  return {
    ...response.data,
    data: contactTransformer.fetchCollection(response.data.data),
  }
}
