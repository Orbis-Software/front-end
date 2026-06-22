import http from "@/api/http"
import exchangeRateTransformer from "@/app/transformers/exchange-rate"
import type { EffectiveExchangeRateParams, ExchangeRate } from "@/app/types/exchange-rate"

export default async function effective(
  params: EffectiveExchangeRateParams,
): Promise<ExchangeRate | null> {
  const response = await http.get("/exchange-rates/effective", {
    params: {
      base: params.base,
      quote: params.quote,
      date: params.date,
    },
  })
  const data = response.data?.data

  return data ? exchangeRateTransformer.fetch(data) : null
}
