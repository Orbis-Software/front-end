import http from "@/api/http"
import { transformTransportQuote } from "@/app/transformers/transportQuote"
import type { TransportQuote } from "@/app/types/transportQuote"

export default async function duplicate(id: number): Promise<TransportQuote> {
  const response = await http.post(`/quotes/${id}/duplicate`)

  return transformTransportQuote(response.data?.data ?? response.data)
}
