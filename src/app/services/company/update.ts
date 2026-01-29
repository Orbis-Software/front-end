import http from '@/api/http'
import companyTransformer from '@/app/transformers/company'
import type { Company, CompanyUpdatePayload } from '@/app/types/company'

type UpdatePayload = CompanyUpdatePayload | FormData

export default async function updateCompany(payload: UpdatePayload): Promise<Company> {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData

  if (isFormData) {
    if (!payload.has('_method')) {
      payload.append('_method', 'PATCH')
    }

    const response = await http.post('/company', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return companyTransformer.fetch(response.data)
  }

  const response = await http.patch('/company', payload)
  return companyTransformer.fetch(response.data)
}
