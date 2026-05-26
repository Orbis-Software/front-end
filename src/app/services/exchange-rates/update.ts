import http from "@/api/http"
import exchangeRateTransformer from "@/app/transformers/exchange-rate"
import type { ExchangeRate, ExchangeRatePayload } from "@/app/types/exchange-rate"

export default async function update(
  id: number,
  payload: ExchangeRatePayload,
): Promise<ExchangeRate> {
  const response = await http.put(`/exchange-rates/${id}`, payload)

  return exchangeRateTransformer.fetch(response.data.data)
}
