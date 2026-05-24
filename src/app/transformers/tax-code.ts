import type { TaxCode } from "@/app/types/tax-code"

function fetch(raw: any): TaxCode {
  return {
    id: Number(raw?.id ?? 0),
    country: raw?.country ?? "",
    code: raw?.code ?? "",
    taxCode: raw?.taxCode ?? "",
    rate: Number(raw?.rate ?? 0),
    description: raw?.description ?? "",
    isActive: raw?.isActive !== false,
  }
}

function fetchCollection(rows: any[] = []): TaxCode[] {
  return rows.map(fetch)
}

export default {
  fetch,
  fetchCollection,
}
