import http from "@/api/http"
import exchangeRateTransformer from "@/app/transformers/exchange-rate"
import type { ExchangeRate, ExchangeRateFilters, ExchangeRateMeta } from "@/app/types/exchange-rate"

export default async function list(params: ExchangeRateFilters = {}): Promise<{
  exchangeRates: ExchangeRate[]
  meta: ExchangeRateMeta
}> {
  const response = await http.get("/exchange-rates", {
    params: {
      search: params.search || undefined,
      sort: params.sort || undefined,
      direction: params.direction || undefined,
      page: params.page || undefined,
      per_page: params.perPage || undefined,
    },
  })

  return {
    exchangeRates: exchangeRateTransformer.fetchCollection(response.data.data),
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
