import http from "@/api/http"
import countryTransformer from "@/app/transformers/country"
import type { Country, ListCountriesParams } from "@/app/types/country"
import type { PaginatedResponse } from "@/app/types/pagination"

export default async function listCountries(
  params: ListCountriesParams = {},
): Promise<PaginatedResponse<Country>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  )

  const response = await http.get("/countries", { params: cleanParams })

  return {
    ...response.data,
    data: countryTransformer.fetchCollection(response.data.data),
  }
}
