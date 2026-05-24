import http from "@/api/http"
import exchangeRateTransformer from "@/app/transformers/exchange-rate"
import type { ExchangeRate } from "@/app/types/exchange-rate"

export default async function reset(): Promise<ExchangeRate[]> {
  const response = await http.post("/exchange-rates/reset")

  return exchangeRateTransformer.fetchCollection(response.data.data)
}
