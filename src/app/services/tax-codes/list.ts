import http from "@/api/http"
import taxCodeTransformer from "@/app/transformers/tax-code"
import type { TaxCode, TaxCodeFilters, TaxCodeMeta } from "@/app/types/tax-code"

export default async function list(params: TaxCodeFilters = {}): Promise<{
  taxCodes: TaxCode[]
  meta: TaxCodeMeta
}> {
  const response = await http.get("/tax-codes", {
    params: {
      search: params.search || undefined,
      sort: params.sort || undefined,
      direction: params.direction || undefined,
      page: params.page || undefined,
      per_page: params.perPage || undefined,
    },
  })

  return {
    taxCodes: taxCodeTransformer.fetchCollection(response.data.data),
    meta: {
      total: Number(response.data.meta?.total ?? 0),
      filtered: Number(response.data.meta?.filtered ?? 0),
      currentPage: Number(response.data.meta?.currentPage ?? 1),
      lastPage: Number(response.data.meta?.lastPage ?? 1),
      perPage: Number(response.data.meta?.perPage ?? 15),
      from: response.data.meta?.from ?? null,
      to: response.data.meta?.to ?? null,
    },
  }
}
