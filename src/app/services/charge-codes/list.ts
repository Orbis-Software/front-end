import http from "@/api/http"
import chargeCodeTransformer from "@/app/transformers/charge-code"
import type { ChargeCode, ChargeCodeFilters, ChargeCodeMeta } from "@/app/types/charge-code"

export default async function list(params: ChargeCodeFilters = {}): Promise<{
  chargeCodes: ChargeCode[]
  meta: ChargeCodeMeta
}> {
  const response = await http.get("/charge-codes", {
    params: {
      search: params.search || undefined,
      classification: params.classification || undefined,
      purchase_nominal: params.purchaseNominal || undefined,
      sales_nominal: params.salesNominal || undefined,
      is_customs: params.isCustoms || undefined,
      sort: params.sort || undefined,
      direction: params.direction || undefined,
      page: params.page || undefined,
      per_page: params.perPage || undefined,
    },
  })

  return {
    chargeCodes: chargeCodeTransformer.fetchCollection(response.data.data),
    meta: {
      total: Number(response.data.meta?.total ?? 0),
      filtered: Number(response.data.meta?.filtered ?? 0),
      currentPage: Number(response.data.meta?.currentPage ?? 1),
      lastPage: Number(response.data.meta?.lastPage ?? 1),
      perPage: Number(response.data.meta?.perPage ?? 15),
      from: response.data.meta?.from ?? null,
      to: response.data.meta?.to ?? null,
      filters: {
        classifications: response.data.meta?.filters?.classifications ?? [],
        purchaseNominals: response.data.meta?.filters?.purchaseNominals ?? [],
        salesNominals: response.data.meta?.filters?.salesNominals ?? [],
      },
    },
  }
}
