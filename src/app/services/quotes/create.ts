import http from "@/api/http"
import { transformTransportQuote } from "@/app/transformers/transportQuote"
import type { TransportQuote, TransportQuotePayload } from "@/app/types/transportQuote"

export default async function create(payload: TransportQuotePayload): Promise<TransportQuote> {
  const response = await http.post("/quotes", payload)

  return transformTransportQuote(response.data?.data ?? response.data)
}
