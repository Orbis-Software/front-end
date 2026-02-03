import http from '@/api/http'
import contactTypeTransformer from '@/app/transformers/contact-type'
import type { ContactType, PaginatedResponse } from '@/app/types/contact-type'

export interface ListContactTypesParams {
  page?: number
  per_page?: number
  q?: string
}

export default async function listContactTypes(
  params: ListContactTypesParams = {}
): Promise<PaginatedResponse<ContactType>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )

  const response = await http.get('/contact-types', { params: cleanParams })

  return {
    ...response.data,
    data: contactTypeTransformer.fetchCollection(response.data.data),
  }
}
