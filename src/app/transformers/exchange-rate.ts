import type { ExchangeRate } from "@/app/types/exchange-rate"

function fetch(raw: any): ExchangeRate {
  return {
    id: Number(raw?.id ?? 0),
    base: raw?.base ?? "",
    quote: raw?.quote ?? "",
    rate: Number(raw?.rate ?? 0),
    effectiveDate: raw?.effectiveDate ?? "",
    isActive: raw?.isActive !== false,
  }
}

function fetchCollection(rows: any[] = []): ExchangeRate[] {
  return rows.map(fetch)
}

export default {
  fetch,
  fetchCollection,
}
