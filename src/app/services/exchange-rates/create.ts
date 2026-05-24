import http from "@/api/http"
import exchangeRateTransformer from "@/app/transformers/exchange-rate"
import type { ExchangeRate, ExchangeRatePayload } from "@/app/types/exchange-rate"

export default async function create(payload: ExchangeRatePayload): Promise<ExchangeRate> {
  const response = await http.post("/exchange-rates", payload)

  return exchangeRateTransformer.fetch(response.data.data)
}
