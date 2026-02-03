import http from '@/api/http'
import countryTransformer from '@/app/transformers/country'
import type { Country, PaginatedResponse } from '@/app/types/country'

export interface ListCountriesParams {
  page?: number
  per_page?: number
  q?: string
}

export default async function listCountries(
  params: ListCountriesParams = {}
): Promise<PaginatedResponse<Country>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )

  const response = await http.get('/countries', { params: cleanParams })

  return {
    ...response.data,
    data: countryTransformer.fetchCollection(response.data.data),
  }
}
