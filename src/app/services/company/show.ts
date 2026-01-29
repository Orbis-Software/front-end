import http from '@/api/http'
import companyTransformer from '@/app/transformers/company'
import type { Company } from '@/app/types/company'

/**
 * =================
 * Show Company
 * =================
 * Assumption: backend provides current company via GET /company
 * If your backend is /companies/:id, tell me and I’ll adjust quickly.
 */
export default async function showCompany(): Promise<Company> {
  const response = await http.get('/company')
  return companyTransformer.fetch(response.data)
}
