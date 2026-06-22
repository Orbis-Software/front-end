import type { ExchangeRate } from "@/app/types/exchange-rate"

function fetch(raw: any): ExchangeRate {
  return {
    id: Number(raw?.id ?? 0),
    base: raw?.base ?? "",
    quote: raw?.quote ?? "",
    rate: Number(raw?.rate ?? 0),
    effectiveDate: raw?.effectiveDate ?? "",
    isActive: raw?.isActive !== false,
    requestedDate: raw?.requestedDate,
    isInverse: Boolean(raw?.isInverse),
    sourceBase: raw?.sourceBase,
    sourceQuote: raw?.sourceQuote,
    sourceRate: raw?.sourceRate === undefined ? undefined : Number(raw.sourceRate),
  }
}

function fetchCollection(rows: any[] = []): ExchangeRate[] {
  return rows.map(fetch)
}

export default {
  fetch,
  fetchCollection,
}
