import http from "@/api/http"
import { transformTransportQuoteCollection } from "@/app/transformers/transportQuote"
import type { TransportQuoteFilters } from "@/app/types/transportQuote"

export default async function list(filters: TransportQuoteFilters = {}) {
  const response = await http.get("/quotes", {
    params: filters,
  })

  return {
    data: transformTransportQuoteCollection(response),
    meta: response.data?.meta ?? null,
    links: response.data?.links ?? null,
  }
}
