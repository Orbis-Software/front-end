import type { ChargeCode } from "@/app/types/charge-code"

function fetch(raw: any): ChargeCode {
  return {
    id: Number(raw?.id ?? 0),
    companyId: raw?.companyId ?? null,
    description: raw?.description ?? "",
    purchaseNominal: raw?.purchaseNominal ?? "",
    salesNominal: raw?.salesNominal ?? "",
    classification: raw?.classification ?? "",
    defaultTaxCode: raw?.defaultTaxCode ?? "",
    isCustoms: Boolean(raw?.isCustoms),
    isActive: raw?.isActive !== false,
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
  }
}

function fetchCollection(rows: any[] = []): ChargeCode[] {
  return rows.map(fetch)
}

export default {
  fetch,
  fetchCollection,
}
