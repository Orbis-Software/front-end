import http from "@/api/http"
import { transformTransportQuote } from "@/app/transformers/transportQuote"
import type { TransportQuote, TransportQuotePayload } from "@/app/types/transportQuote"

export default async function update(
  id: number,
  payload: TransportQuotePayload,
): Promise<TransportQuote> {
  const response = await http.put(`/quotes/${id}`, payload)

  return transformTransportQuote(response.data?.data ?? response.data)
}
