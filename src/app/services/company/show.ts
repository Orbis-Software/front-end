import http from '@/api/http'
import companyTransformer from '@/app/transformers/company'
import type { Company } from '@/app/types/company'

/**
 * GET /company
 */
export default async function showCompany(): Promise<Company> {
  const response = await http.get('/company')
  return companyTransformer.fetch(response.data)
}
