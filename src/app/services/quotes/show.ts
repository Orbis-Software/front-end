import http from "@/api/http"
import { transformTransportQuote } from "@/app/transformers/transportQuote"
import type { TransportQuote } from "@/app/types/transportQuote"

export default async function show(id: number): Promise<TransportQuote> {
  const response = await http.get(`/quotes/${id}`)

  return transformTransportQuote(response.data?.data ?? response.data)
}
